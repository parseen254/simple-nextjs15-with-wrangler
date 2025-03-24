import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface OtpEmailProps {
    otp: string;
    recipientName?: string;
}

export default function OtpEmail({ otp = '000000', recipientName = 'there' }: OtpEmailProps) {
    // Format OTP with spaces without using split
    const formattedOtp = otp ? otp.toString().split('').join(' ') : '';

    if (!otp) {
        throw new Error('OTP is required');
    }

    return (
        <Html>
            <Head />
            <Preview>Your login verification code</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Login Verification
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {recipientName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Please use the verification code below to complete your login:
                        </Text>
                        <Section className="text-center my-[32px] mx-0">
                            <Text className="text-[36px] font-bold tracking-[6px] p-2 bg-blue-50 rounded">
                                {formattedOtp}
                            </Text>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This email was intended for {recipientName}. If you were not expecting this email, you can ignore it.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}