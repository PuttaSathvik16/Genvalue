import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
} from "../services/passwordResetService.js";

export async function sendPasswordResetOtp(req, res) {
  try {
    const { email } = req.body;
    const result = await requestPasswordResetOtp(email);

    return res.status(result.status).json({
      success: result.ok,
      message: result.message,
      ...(result.hint ? { hint: result.hint } : {}),
    });
  } catch (error) {
    console.error("[passwordReset] send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset code",
    });
  }
}

export async function verifyPasswordResetOtpHandler(req, res) {
  try {
    const { email, otp } = req.body;
    const result = await verifyPasswordResetOtp(email, otp);

    return res.status(result.status).json({
      success: result.ok,
      message: result.message,
      ...(result.data ? { data: result.data } : {}),
    });
  } catch (error) {
    console.error("[passwordReset] verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify reset code",
    });
  }
}

export async function resetPasswordHandler(req, res) {
  try {
    const { resetToken, password, confirmPassword } = req.body;
    const result = await resetPasswordWithToken({ resetToken, password, confirmPassword });

    return res.status(result.status).json({
      success: result.ok,
      message: result.message,
    });
  } catch (error) {
    console.error("[passwordReset] reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
}
