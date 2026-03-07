// Unit tests for emailService.js
const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
    let mockTransporter;
    let sendEmailOTP;

    beforeEach(() => {
        // Reset modules to ensure fresh import with mocks
        jest.resetModules();
        jest.clearAllMocks();

        // Create mock transporter
        mockTransporter = {
            sendMail: jest.fn()
        };

        // Setup the mock before requiring the module
        const nodemailerMock = require('nodemailer');
        nodemailerMock.createTransport.mockReturnValue(mockTransporter);

        // Now require the email service (which will use the mocked createTransport)
        sendEmailOTP = require('../../../src/utils/emailService').sendEmailOTP;
    });

    describe('sendEmailOTP', () => {
        it('should send OTP email successfully when credentials are configured', async () => {
            // Set environment variables
            process.env.EMAIL_USER = 'test@voteguard.com';
            process.env.EMAIL_PASS = 'test-password';

            // Re-require to pick up env vars
            jest.resetModules();
            const nodemailerMock = require('nodemailer');
            nodemailerMock.createTransport.mockReturnValue(mockTransporter);
            sendEmailOTP = require('../../../src/utils/emailService').sendEmailOTP;

            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

            const result = await sendEmailOTP('user@example.com', '123456');

            expect(result).toBe(true);
            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: expect.stringContaining('VoteGuard Security'),
                    to: 'user@example.com',
                    subject: expect.stringContaining('VoteGuard Verification Code'),
                    html: expect.stringContaining('123456')
                })
            );
        });

        it('should include OTP code in email HTML', async () => {
            process.env.EMAIL_USER = 'test@voteguard.com';
            process.env.EMAIL_PASS = 'test-password';

            // Re-require to pick up env vars
            jest.resetModules();
            const nodemailerMock = require('nodemailer');
            nodemailerMock.createTransport.mockReturnValue(mockTransporter);
            sendEmailOTP = require('../../../src/utils/emailService').sendEmailOTP;

            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

            await sendEmailOTP('user@example.com', '654321');

            const callArgs = mockTransporter.sendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('654321');
            expect(callArgs.html).toContain('expires in 5 minutes');
        });

        it('should mock email send when credentials are missing', async () => {
            // Save original values and set to empty to simulate missing credentials
            const originalEmailUser = process.env.EMAIL_USER;
            const originalEmailPass = process.env.EMAIL_PASS;
            process.env.EMAIL_USER = '';
            process.env.EMAIL_PASS = '';

            // Re-require after clearing env vars
            jest.resetModules();

            // Mock dotenv to prevent it from loading .env file again
            jest.doMock('dotenv', () => ({
                config: jest.fn()
            }));

            const nodemailerMock = require('nodemailer');
            nodemailerMock.createTransport.mockReturnValue(mockTransporter);
            const { sendEmailOTP: sendEmailOTPNoCredentials } = require('../../../src/utils/emailService');

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const result = await sendEmailOTPNoCredentials('user@example.com', '111111');

            expect(result).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('EMAIL CREDENTIALS MISSING')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[MOCK EMAIL]')
            );
            expect(mockTransporter.sendMail).not.toHaveBeenCalled();

            consoleSpy.mockRestore();

            // Restore env vars
            process.env.EMAIL_USER = originalEmailUser;
            process.env.EMAIL_PASS = originalEmailPass;
        });

        it('should handle email send failure gracefully', async () => {
            process.env.EMAIL_USER = 'test@voteguard.com';
            process.env.EMAIL_PASS = 'test-password';

            // Re-require to pick up env vars
            jest.resetModules();
            const nodemailerMock = require('nodemailer');
            nodemailerMock.createTransport.mockReturnValue(mockTransporter);
            sendEmailOTP = require('../../../src/utils/emailService').sendEmailOTP;

            const error = new Error('SMTP connection failed');
            mockTransporter.sendMail.mockRejectedValue(error);

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await sendEmailOTP('user@example.com', '999999');

            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Email Send Failed'),
                error
            );

            consoleErrorSpy.mockRestore();
        });

        it('should format email correctly with proper HTML structure', async () => {
            process.env.EMAIL_USER = 'test@voteguard.com';
            process.env.EMAIL_PASS = 'test-password';

            // Re-require to pick up env vars
            jest.resetModules();
            const nodemailerMock = require('nodemailer');
            nodemailerMock.createTransport.mockReturnValue(mockTransporter);
            sendEmailOTP = require('../../../src/utils/emailService').sendEmailOTP;

            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

            await sendEmailOTP('user@example.com', '456789');

            const callArgs = mockTransporter.sendMail.mock.calls[0][0];
            expect(callArgs.html).toContain('<div');
            expect(callArgs.html).toContain('VoteGuard Security');
            expect(callArgs.html).toContain('456789');
            expect(callArgs.html).toMatch(/font-family/); // Check for styling
        });

        it('should use correct email service configuration', () => {
            process.env.EMAIL_USER = 'voteguard@gmail.com';
            process.env.EMAIL_PASS = 'secure-password';

            // Clear and reset modules
            jest.resetModules();
            const nodemailerModule = require('nodemailer');
            nodemailerModule.createTransport.mockReturnValue(mockTransporter);

            // Re-require to trigger createTransport call with env vars
            require('../../../src/utils/emailService');

            expect(nodemailerModule.createTransport).toHaveBeenCalledWith(
                expect.objectContaining({
                    service: 'gmail',
                    auth: {
                        user: 'voteguard@gmail.com',
                        pass: 'secure-password'
                    }
                })
            );
        });

        it('should handle different OTP codes', async () => {
            process.env.EMAIL_USER = 'test@voteguard.com';
            process.env.EMAIL_PASS = 'test-password';

            // Re-require to pick up env vars
            jest.resetModules();
            const nodemailerMock = require('nodemailer');
            nodemailerMock.createTransport.mockReturnValue(mockTransporter);
            sendEmailOTP = require('../../../src/utils/emailService').sendEmailOTP;

            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

            const testCodes = ['000000', '999999', '123456', '567890'];

            for (const code of testCodes) {
                await sendEmailOTP('user@example.com', code);
                const callArgs = mockTransporter.sendMail.mock.calls[mockTransporter.sendMail.mock.calls.length - 1][0];
                expect(callArgs.html).toContain(code);
            }
        });
    });
});
