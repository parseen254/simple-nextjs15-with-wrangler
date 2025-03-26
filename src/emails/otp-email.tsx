import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface OtpEmailProps {
    otp: string;
    recipientName?: string;
}


export default function OtpEmail({ 
    otp = '000000', 
    recipientName
}: OtpEmailProps) {
    if (!otp) {
        throw new Error('OTP is required');
    }

    const formattedOtp = otp.toString();

    return (
        <Html>
            <Head />
            <Preview>Your verification code for secure login</Preview>
            <Tailwind>
                <Body className="bg-gray-50 my-auto mx-auto font-sans">
                    <Container className="my-[40px] mx-auto w-[465px] rounded-lg overflow-hidden">
                        {/* Header Section */}
                        <Section className="bg-primary px-8 py-6 text-center">
                            <Heading className="text-white text-2xl font-bold m-0">
                                Secure Login Verification
                            </Heading>
                        </Section>

                        {/* Main Content */}
                        <Section className="bg-white px-8 py-10">
                            <Text className="text-gray-700 text-base mb-6">
                                {recipientName ? `Hello ${recipientName},` : 'Hello,'}
                            </Text>
                            
                            <Text className="text-gray-700 text-base mb-6">
                                Thanks for keeping your account secure. Please use the verification code below to complete your login:
                            </Text>

                            {/* Verification Code Section */}
                            <Section className="my-8">
                                <Text className="text-sm font-medium text-gray-600 mb-2 text-center">
                                    Verification Code
                                </Text>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <Text className="text-4xl font-mono font-bold tracking-[0.3em] text-center text-gray-900 m-0">
                                        {formattedOtp}
                                    </Text>
                                </div>
                                <Text className="text-sm text-gray-500 mt-2 text-center">
                                    This code will expire in 15 minutes
                                </Text>
                            </Section>

                            <Text className="text-gray-700 text-sm">
                                If you didn&apos;t request this code, you can safely ignore this email. Someone might have typed your email address by mistake.
                            </Text>
                        </Section>

                        <Hr className="border-gray-200 my-4" />

                        {/* Footer */}
                        <Section className="bg-white px-8 py-6">
                            <Text className="text-gray-500 text-xs text-center">
                                This is an automated message, please do not reply. We will never ask for your password or personal information via email.
                            </Text>
                            <Text className="text-gray-500 text-xs text-center mt-4">
                                © 2025 Todo.App. All rights reserved.
                                <br />
                                <Link 
                                    href="#" 
                                    className="text-primary hover:text-primary/90 underline mx-2"
                                >
                                    Privacy Policy
                                </Link>
                                •
                                <Link 
                                    href="#" 
                                    className="text-primary hover:text-primary/90 underline mx-2"
                                >
                                    Terms of Service
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}