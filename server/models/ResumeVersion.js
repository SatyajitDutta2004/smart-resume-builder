const mongoose = require("mongoose");

const ResumeVersionSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  industry: { type: String, trim: true, default: "" },
  targetRole: { type: String, trim: true, default: "" },
  personalInfo: {
    fullName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
  },
  templateType: { type: String, default: "classic" },
  theme: { type: String, trim: true, default: "blue" },
  github: { type: String, trim: true, default: "" },
  linkedin: { type: String, trim: true, default: "" },
  portfolio: { type: String, trim: true, default: "" },
  sections: { type: Object, default: {} },
  versionNumber: { type: Number, default: 1 },
  versionName: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ResumeVersion", ResumeVersionSchema);
