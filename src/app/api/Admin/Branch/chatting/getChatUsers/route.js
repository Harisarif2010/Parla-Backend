import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../../libs/corsHeader";
import Message from "../../../../../../../models/Message";
import Customer from "../../../../../../../models/Customer";
import Employee from "../../../../../../../models/Employee";
import Admin from "../../../../../../../models/Admin";

export async function GET(req) {
  try {
    await connectMongoDB();
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401, headers: corsHeaders }
      );
    }

    const currentUserId = token.id;

    // Get all messages where current user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    }).sort({ createdAt: -1 });

    const chatMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId.toString() === currentUserId;
      const otherUserId = isSender
        ? msg.receiverId.toString()
        : msg.senderId.toString();
      const otherUserType = isSender ? msg.receiverType : msg.senderType;

      const key = `${otherUserType}_${otherUserId}`;

      if (!chatMap.has(key)) {
        chatMap.set(key, {
          userId: otherUserId,
          userType: otherUserType,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // 🔍 Add these logs
      if (!isSender || msg.isRead === false) {
        const current = chatMap.get(key);
        chatMap.set(key, {
          ...current,
          unreadCount: current.unreadCount + 1,
        });
      }
    }

    // Organize by type
    const userGroups = {
      customer: [],
      employee: [],
      admin: [],
      // branchAdmin: [],
    };

    for (const [key, value] of chatMap.entries()) {
      const normalizedType = value.userType?.toLowerCase();

      if (!normalizedType || !userGroups[normalizedType]) {
        console.warn(
          `Unknown userType '${value.userType}' for userId '${value.userId}'`
        );
        continue;
      }
      userGroups[normalizedType].push(value.userId);
    }
    // Query all types
    const [customers, employees, admin] = await Promise.all([
      Customer.find({ _id: { $in: userGroups.customer } }).select(
        "_id firstName lastName image"
      ),
      Employee.find({ _id: { $in: userGroups.employee } }).select(
        "_id firstName lastName image"
      ),
      Admin.find({ _id: { $in: userGroups.admin } }).select(
        "_id firstName lastName image"
      ),
    ]);

    const allUsers = [...customers, ...employees , ...admin];

    // Merge data
    const chatUsers = allUsers.map((user) => {
      const matchedKey = Array.from(chatMap.keys()).find((key) =>
        key.endsWith(user._id.toString())
      );
      const chatData = matchedKey ? chatMap.get(matchedKey) : {};
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        userType: chatData?.userType || "",
        lastMessage: chatData?.lastMessage || "",
        lastMessageAt: chatData?.lastMessageAt || null,
        unreadCount: chatData?.unreadCount || 0,
      };
    });
    // console.log(chatUsers);

    return NextResponse.json(
      {
        message: "All Chat Users",
        data: chatUsers,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error Fetching All Users For Chat", err);
    return NextResponse.json(
      { error: "Error Fetching All Users For Chat" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
