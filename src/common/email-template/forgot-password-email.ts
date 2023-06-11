export function forgotPasswordEmail({
  email,
  firstName,
  token,
}: {
  email: string;
  firstName: string;
  token: string;
}) {
  const clientName = 'RunX';
  const clientBaseUrl = 'localhost:5000';
  const resetLink = `${clientBaseUrl}/accounts/reset-password/${token}`;
  const emailMessage = {
    from: `runX <noreply@runx.com>`,
    to: `${email}`,
    subject: `PASSWORD RESET LINK`,
    html: `    
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>Welcome to Our Site</title>
              </head>
              <body>
	            <h3>Hi ${firstName}</h3>
                <p>A request has been recieved to change the password to your ${clientName} account</p>
                <button>
                <a href='${resetLink}'>
                  Reset Password
                </a>
                </button>
                <p>
                If you are having trouble clicking the password reset button, 
                kindly copy and paste the url below into your web browser
                </p>
                <p>${resetLink}</p>
            
            
                <h1>P.S</h1>
                <p>if you did not request a password reset, kindly ignore this email</p>
            
                <p>Sincerely</p>
                <p>${clientName} Team</p>  
              </body>
            </html>
	
    `,
  };
  return emailMessage;
}
