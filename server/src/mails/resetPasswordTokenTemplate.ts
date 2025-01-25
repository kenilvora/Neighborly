export const resetPasswordTokenTemplate = (url: string, name: string) => {
  return `<!DOCTYPE html>
      <html lang="en">
  
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 0;
                  }
  
                  .container {
                      background-color: #ffffff;
                      border-radius: 8px;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }
  
                  .header {
                      text-align: center;
                      margin-bottom: 30px;
                  }
  
                  h1 {
                      color: #333;
                      margin-bottom: 20px;
                  }
  
                  p {
                      color: #666;
                      margin-bottom: 20px;
                      font-size: 18px;
                  }
  
                  .cta-button {
                      display: inline-block;
                      padding: 15px 25px;
                      background-color: #E7C009;
                      color: black !important;
                      text-decoration: none;
                      border-radius: 5px;
                      transition: background-color 0.3s ease;
                      font-size: 18px; /* Increased font size */
                      font-weight: 700; /* Font weight set to 700 */
                  }
  
                  .footer {
                      margin-top: 30px;
                      color: #666;
                  }
              </style>
          </head>
  
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Password Reset</h1>
                  </div>
                  <p>Hello ${name},</p>
                  <p>We received a request to reset your password. To proceed, please click the button below:</p>
                  <a class="cta-button" href="${url}" target="_blank">Reset Password</a>
                  <p>If you did not request this change, you can safely ignore this email.</p>
                  <p class="footer">Thank you,<br>Neighborly</p>
              </div>
          </body>
  
      </html>`;
};
