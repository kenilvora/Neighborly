export const itemAddedTemplate = (title: string) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Item Added Successfully</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .email-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        background-color: #007bff;
        color: #ffffff;
        padding: 20px;
        border-radius: 8px 8px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        font-size: 20px;
        color: #333333;
      }
      .content p {
        font-size: 16px;
        color: #555555;
        line-height: 1.5;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #888888;
      }
      .btn {
        display: inline-block;
        padding: 10px 20px;
        background-color: #28a745;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
      .btn:hover {
        background-color: #218838;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Success!</h1>
      </div>
      <div class="content">
        <h2>Dear User,</h2>
        <p>
          We are pleased to inform you that your item titled
          <strong>"${title}"</strong> has been successfully added to our
          platform. Thank you for contributing to our marketplace!
        </p>
        <p>
          Your item is now visible and available for browsing by potential
          customers. You can track its performance and manage your listings from
          your account dashboard.
        </p>
        <p>
          If you need any assistance, feel free to reach out to our support
          team.
        </p>
        <a href="[Link to Dashboard]" class="btn">View Your Dashboard</a>
      </div>
      <div class="footer">
        <p>&copy; 2025 Neighbourly. All rights reserved.</p>
        <p>
          If you did not add this item, please contact our support immediately.
        </p>
      </div>
    </div>
  </body>
</html>
`;
};
