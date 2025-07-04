const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    news: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    appointment: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    message: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    notification: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    finance: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    statistics: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    customer: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    branches: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    products: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    maps: {
      see: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },

  {
    timestamps: true,
  }
);

const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

export default Permission;
