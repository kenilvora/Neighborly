export const otpTemplate = (otp: number) => {
  return `<!DOCTYPE html>
  <html>
    <body>
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        "
      >
        <div
          style="
            background: #007bff;
            color: #fff;
            padding: 15px;
            text-align: center;
            font-size: 24px;
          "
        >
          Verification Code
        </div>
        <div
          style="padding: 20px; font-size: 16px; line-height: 1.5; color: #333"
        >
          <p>
            Thank you for using our service. Please use the OTP below to verify
            your account. The OTP is valid for 5 minutes.
          </p>
          <div
            style="
              display: inline-block;
              background: #f2f2f2;
              padding: 10px 15px;
              font-size: 20px;
              font-weight: bold;
              color: #007bff;
              border-radius: 4px;
              margin: 10px 0;
            "
          >
            ${otp}
          </div>
          <p>
            If you did not request this OTP, please ignore this email or contact
            support.
          </p>
          <p>Best regards,<br />Neighbourly Team</p>
        </div>
        <div
          style="
            text-align: center;
            font-size: 14px;
            color: #666;
            padding: 10px;
            background: #f9f9f9;
          "
        >
          &copy; ${new Date().getFullYear()} Neighbourly. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;
};
