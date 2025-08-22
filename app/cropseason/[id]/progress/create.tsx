import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

import BackButton from '@/components/BackButton';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import { CropProgressCreatePayload, createCropProgress } from '@/core/api/cropProgress.api';
import { CropStageListItem, getAllCropStages } from '@/core/api/cropStage.api';

export default function CreateProgressScreen() {
    const { id, detailId } = useLocalSearchParams<{ id: string; detailId: string }>();
    const router = useRouter();

    const [stages, setStages] = useState<CropStageListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [stagesLoading, setStagesLoading] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Form state
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [progressDate, setProgressDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Dropdown state
    const [stageOpen, setStageOpen] = useState(false);
    const [stageItems, setStageItems] = useState<{ label: string; value: string }[]>([]);

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    const fetchStages = async () => {
        setStagesLoading(true);
        try {
            const result = await getAllCropStages();
            if (result.code === 200 && result.data) {
                setStages(result.data);
                setStageItems(
                    result.data.map(stage => ({
                        label: stage.stageNameVi || stage.stageName,
                        value: stage.stageCode,
                    }))
                );
            }
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách giai đoạn');
        } finally {
            setStagesLoading(false);
        }
    };

    useEffect(() => {
        fetchStages();
    }, []);

    const handleSubmit = async () => {
        if (!selectedStage) {
            showSnackbar('Vui lòng chọn giai đoạn');
            return;
        }

        if (!description.trim()) {
            showSnackbar('Vui lòng nhập mô tả tiến độ');
            return;
        }

        setLoading(true);
        try {
            const payload: CropProgressCreatePayload = {
                cropSeasonDetailId: detailId,
                stageCode: selectedStage,
                progressDate: progressDate.toISOString(),
                description: description.trim(),
                notes: notes.trim() || undefined,
            };

            const result = await createCropProgress(payload);
            if (result.code === 200) {
                showSnackbar('Tạo tiến độ thành công');
                setTimeout(() => {
                    router.back();
                }, 1500);
            } else {
                showSnackbar(result.message || 'Tạo tiến độ thất bại');
            }
        } catch (error) {
            showSnackbar('Lỗi khi tạo tiến độ');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return format(date, 'dd/MM/yyyy', { locale: vi });
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setProgressDate(selectedDate);
        }
    };

    if (stagesLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FD7622" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>Thêm tiến độ mới</Text>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                {/* Giai đoạn */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Giai đoạn *</Text>
                    <DropDownPicker
                        open={stageOpen}
                        value={selectedStage}
                        items={stageItems}
                        setOpen={setStageOpen}
                        setValue={setSelectedStage}
                        setItems={setStageItems}
                        placeholder="Chọn giai đoạn"
                        style={styles.dropdown}
                        textStyle={styles.dropdownText}
                        zIndex={3000}
                        zIndexInverse={1000}
                    />
                </View>

                {/* Ngày tiến độ */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ngày tiến độ *</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>📅 {formatDate(progressDate)} ▼</Text>
                    </TouchableOpacity>
                </View>

                {/* Mô tả */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mô tả tiến độ *</Text>
                    <TextInput
                        mode="outlined"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Mô tả chi tiết tiến độ phát triển..."
                        multiline
                        numberOfLines={4}
                        style={styles.textInput}
                        outlineColor="#D1D5DB"
                        activeOutlineColor="#FD7622"
                    />
                </View>

                {/* Ghi chú */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                        mode="outlined"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Ghi chú thêm (nếu có)..."
                        multiline
                        numberOfLines={3}
                        style={styles.textInput}
                        outlineColor="#D1D5DB"
                        activeOutlineColor="#FD7622"
                    />
                </View>

                {/* Nút submit */}
                <View style={styles.submitContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || !selectedStage || !description.trim()}
                        style={styles.submitButton}
                        contentStyle={styles.submitButtonContent}
                        labelStyle={styles.submitButtonLabel}
                    >
                        Tạo tiến độ
                    </Button>
                </View>
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={progressDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* Snackbar */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Đóng',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFAF4',
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D74F0F',
        marginBottom: 24,
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEFAF4',
    },
    form: {
        flex: 1,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    dropdown: {
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
        marginLeft: 12,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
    },
    submitContainer: {
        marginTop: 32,
        marginBottom: 40,
    },
    submitButton: {
        backgroundColor: '#FD7622',
        borderRadius: 8,
    },
    submitButtonContent: {
        paddingVertical: 8,
    },
    submitButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
});
