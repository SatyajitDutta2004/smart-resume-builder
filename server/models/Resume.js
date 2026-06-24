const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
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
  themeCustom: {
    primaryColor: { type: String, default: "#2563eb" },
    fontFamily: { type: String, default: "Inter, system-ui" },
    layout: { type: String, default: "standard" },
  },
  github: { type: String, trim: true, default: "" },
  linkedin: { type: String, trim: true, default: "" },
  portfolio: { type: String, trim: true, default: "" },
  sections: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Resume", ResumeSchema);
