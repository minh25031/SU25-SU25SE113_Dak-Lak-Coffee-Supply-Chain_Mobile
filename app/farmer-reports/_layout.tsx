import { Stack } from 'expo-router';

export default function FarmerReportsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Tư vấn kỹ thuật',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="create"
                options={{
                    title: 'Tạo báo cáo',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Chi tiết báo cáo',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
