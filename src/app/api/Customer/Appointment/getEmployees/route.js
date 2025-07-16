import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Employee from "../../../../../../models/Employee";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import mongoose from "mongoose";
import Appointment from "../../../../../../models/Appointment";

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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const category = searchParams.get("category");
    const branchId = searchParams.get("branchId");

    if (!category || !branchId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400, headers: corsHeaders }
      );
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDay = days[new Date().getDay()];

    const totalCount = await Employee.countDocuments({
      serviceType: category,
      branchId: new mongoose.Types.ObjectId(branchId),
    });

    const generateSlots = (fromTime, toTime) => {
      const slots = [];

      const [fromHour, fromMin] = fromTime.split(":").map(Number);
      const [toHour, toMin] = toTime.split(":").map(Number);

      let start = new Date();
      start.setHours(fromHour, fromMin, 0, 0);

      const end = new Date();
      end.setHours(toHour, toMin, 0, 0);

      while (start.getTime() + 30 * 60000 <= end.getTime()) {
        const endSlot = new Date(start.getTime() + 30 * 60000);

        const format = (d) => {
          const hours = d.getHours().toString().padStart(2, "0");
          const minutes = d.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        };

        slots.push(`${format(start)} - ${format(endSlot)}`);

        // Move to next slot with 10 min break
        start = new Date(endSlot.getTime() + 10 * 60000);
      }

      return slots;
    };

    const getEmployees = await Employee.aggregate([
      {
        $match: {
          serviceType: category,
          branchId: new mongoose.Types.ObjectId(branchId),
        },
      },
      {
        $addFields: {
          isAvailableToday: {
            $in: [
              currentDay,
              {
                $map: {
                  input: { $ifNull: ["$workingHours", []] },
                  as: "wh",
                  in: "$$wh.day",
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          serviceType: 1,
          image: 1,
          workingHours: 1,
          isAvailableToday: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    // Add available time slots for the next 7 days
    const result = await Promise.all(
      getEmployees.map(async (emp) => {
        const availableSlots = [];

        for (const schedule of emp.workingHours || []) {
          if (schedule?.from && schedule?.to && schedule?.day) {
            const allSlots = generateSlots(schedule.from, schedule.to);
               

            const today = new Date();
            
            const targetDayIndex = days.indexOf(schedule.day);
           

            for (let i = 0; i < 7; i++) {
              const checkDate = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + i
              );
                

              if (checkDate.getDay() === targetDayIndex) {
                const slotDateStr = `${checkDate.getFullYear()}-${(
                  checkDate.getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")}-${checkDate
                  .getDate()
                  .toString()
                  .padStart(2, "0")}`;


              const employeeAppointments = await Appointment.find({
                employeeId: emp._id.toString(), // 👈 fixed!
                status: { $in: ["pending", "confirmed"] },
                bookingDate: slotDateStr,
              });

                const bookedSlots = employeeAppointments
                  .map((appt) => appt.bookingTime?.trim())
                  .filter((slot) => slot);

                const filteredSlots = allSlots.filter((slot) => {
                  const normalizedSlot = slot.trim().replace(/\s+/g, " ");
                  const isBooked = bookedSlots.some((bookedSlot) => {
                    const normalizedBookedSlot = bookedSlot
                      .trim()
                      .replace(/\s+/g, " ");
                    return normalizedSlot === normalizedBookedSlot;
                  });
                  return !isBooked;
                });

                availableSlots.push({
                  day: schedule.day,
                  date: slotDateStr,
                  slots: filteredSlots,
                });
              }
            }
          }
        }

        return {
          ...emp,
          availableSlots,
          allSlots: (emp.workingHours || []).flatMap((schedule) => {
            const slotsPerDay = [];
            if (schedule?.from && schedule?.to && schedule?.day) {
              const allSlots = generateSlots(schedule.from, schedule.to);
              const today = new Date();
              const targetDayIndex = days.indexOf(schedule.day);

              for (let i = 0; i < 7; i++) {
                const checkDate = new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate() + i
                );

                if (checkDate.getDay() === targetDayIndex) {
                  const slotDateStr = `${checkDate.getFullYear()}-${(
                    checkDate.getMonth() + 1
                  )
                    .toString()
                    .padStart(2, "0")}-${checkDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}`;

                  slotsPerDay.push({
                    day: schedule.day,
                    date: slotDateStr,
                    slots: allSlots,
                  });
                }
              }
            }
            return slotsPerDay;
          }),
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        message: "All Employees",
        data: result,
        pagination: {
          currentPage: page,
          totalPages,
          hasMore,
          totalCount,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("Error Fetching All Employees", err);
    return NextResponse.json(
      { error: "Error Fetching All Employees" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
