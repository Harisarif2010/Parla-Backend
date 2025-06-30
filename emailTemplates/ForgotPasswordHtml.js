export const ForgotPasswordHtml = `<!DOCTYPE html>
<html>
<head>
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #F8F8F8;
}
.section-verifi {
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}
.container {
    text-align: center;
    align-items: center;
    width: 70%;
    margin: 0 auto;
    padding: 40px 20px;
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border:  1px solid #d4274b;
}
.container img {
    width: 200px;
    height: auto;
}
.title {
    font-size: 24px;
    color: #1C1C1C;
    margin-bottom: 10px;
    font-weight: bold;
}
.content2 {
    margin-top: 20px;
    margin-bottom: 20px;
}
.button-verifi {
    margin: 10px 0;
}
</style>
</head>
<body>
    <div class="section-verifi">
        <div class="container">
            <h1 class="title">Password Reset OTP</h1>
            <p class="content2">
                Your OTP is : {{otp}}
            </p>    
            <p class="content2">
                If this is not you, please ignore this email.
            </p>
            <p class="content2">
                If you have any concerns, please contact us at >PARLA App</a>.
            </p>
            <p class="content2">
                Thank you for choosing PARLA App!
            </p>
        </div>
    </div>
</body>
</html>`;
