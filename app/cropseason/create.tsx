import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Snackbar } from 'react-native-paper';

import BackButton from '@/components/BackButton';
import { createCropSeason } from '@/core/api/cropSeason.api';
import { getAvailableCommitments, type FarmingCommitmentItem } from '@/core/api/FarmingCommitmentItem';

type DropdownItem = { label: string; value: string };

const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;
};

const toInputDate = (date: Date): string =>
    `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate()
        .toString()
        .padStart(2, '0')}`;

const getSeasonLabelByMonth = (month: number): string => {
    if (month >= 1 && month <= 3) return 'Xuân';
    if (month >= 4 && month <= 6) return 'Hạ';
    if (month >= 7 && month <= 9) return 'Thu';
    return 'Đông';
};

export default function CreateCropSeasonScreen() {
    const router = useRouter();

    const [form, setForm] = useState({
        seasonName: '',
        startDate: null as Date | null,
        endDate: null as Date | null,
        note: '',
        commitmentId: '',
    });

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCommitments, setIsLoadingCommitments] = useState(true);
    const [commitmentItems, setCommitmentItems] = useState<DropdownItem[]>([]);
    const [commitmentOpen, setCommitmentOpen] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const showSnackbar = (msg: string) => {
        setSnackbarMessage(msg);
        setSnackbarVisible(true);
    };

    useEffect(() => {
        const fetchCommitments = async () => {
            try {
                const data = await getAvailableCommitments();
                const mapped: DropdownItem[] = data.map((c: FarmingCommitmentItem) => ({
                    label: `${c.commitmentCode} (${c.commitmentName})`,
                    value: c.commitmentId,
                }));
                setCommitmentItems(mapped);
            } catch (err: any) {
                showSnackbar(err?.message || 'Không thể tải danh sách cam kết.');
            } finally {
                setIsLoadingCommitments(false);
            }
        };

        fetchCommitments();
    }, []);

    useEffect(() => {
        if (!form.startDate) return;
        const month = form.startDate.getMonth() + 1;
        const year = form.startDate.getFullYear();
        const label = `Mùa vụ ${getSeasonLabelByMonth(month)} ${year}`;
        if (form.seasonName.trim() === '' || form.seasonName.startsWith('Mùa vụ')) {
            setForm((prev) => ({ ...prev, seasonName: label }));
        }
    }, [form.startDate]);

    const handleSubmit = async () => {
        const { seasonName, startDate, endDate, commitmentId } = form;

        if (!seasonName || !startDate || !endDate || !commitmentId) {
            showSnackbar('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        if (startDate >= endDate) {
            showSnackbar('Ngày bắt đầu phải trước ngày kết thúc.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createCropSeason({
                seasonName,
                note: form.note,
                commitmentId,
                startDate: toInputDate(startDate),
                endDate: toInputDate(endDate),
            });

            showSnackbar('Tạo mùa vụ thành công!');
            setTimeout(() => router.push('/cropseason'), 1000);
        } catch (err: any) {
            showSnackbar(err?.message || 'Đã xảy ra lỗi khi tạo mùa vụ.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
            <BackButton goBack={() => router.back()} />
            <Text style={styles.title}>Tạo mùa vụ mới</Text>

            <Text style={styles.label}>Tên mùa vụ *</Text>
            <TextInput
                style={styles.input}
                value={form.seasonName}
                onChangeText={(text) => setForm({ ...form, seasonName: text })}
                placeholder="Nhập tên mùa vụ"
            />

            <Text style={styles.label}>Ngày bắt đầu *</Text>
            <Pressable onPress={() => setShowStartPicker(true)} style={styles.datePicker}>
                <Text style={styles.dateText}>
                    {form.startDate ? formatDate(form.startDate) : 'Chọn ngày bắt đầu'}
                </Text>
            </Pressable>
            {showStartPicker && (
                <DateTimePicker
                    value={form.startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, date) => {
                        setShowStartPicker(false);
                        if (date) setForm((prev) => ({ ...prev, startDate: date }));
                    }}
                />
            )}

            <Text style={styles.label}>Ngày kết thúc *</Text>
            <Pressable onPress={() => setShowEndPicker(true)} style={styles.datePicker}>
                <Text style={styles.dateText}>
                    {form.endDate ? formatDate(form.endDate) : 'Chọn ngày kết thúc'}
                </Text>
            </Pressable>
            {showEndPicker && (
                <DateTimePicker
                    value={form.endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, date) => {
                        setShowEndPicker(false);
                        if (date) setForm((prev) => ({ ...prev, endDate: date }));
                    }}
                />
            )}

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={form.note}
                onChangeText={(text) => setForm({ ...form, note: text })}
                placeholder="Thêm ghi chú (nếu có)"
                multiline
            />

            <Text style={styles.label}>Chọn cam kết *</Text>
            <View style={styles.dropdownWrapper}>
                {isLoadingCommitments ? (
                    <ActivityIndicator color="#FD7622" />
                ) : (
                    <DropDownPicker
                        open={commitmentOpen}
                        value={form.commitmentId || null}
                        items={commitmentItems}
                        setOpen={setCommitmentOpen}
                        setItems={setCommitmentItems}
                        setValue={(callback) =>
                            setForm((prev) => ({
                                ...prev,
                                commitmentId:
                                    typeof callback === 'function' ? callback(prev.commitmentId) : callback,
                            }))
                        }
                        placeholder="Chọn cam kết"
                        style={styles.dropdown}
                        dropDownContainerStyle={{ borderColor: '#D1D5DB' }}
                        listMode="SCROLLVIEW"
                        zIndex={1000}
                    />
                )}
            </View>

            <Pressable
                style={[styles.button, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                <Text style={styles.buttonText}>
                    {isSubmitting ? 'Đang tạo...' : 'Tạo mùa vụ'}
                </Text>
            </Pressable>

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
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FEFAF4',
        flexGrow: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D74F0F',
        marginBottom: 20,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
        color: '#6F4E37',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
        backgroundColor: '#fff',
    },
    datePicker: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 14,
        backgroundColor: '#fff',
    },
    dateText: {
        color: '#1F2937',
    },
    dropdownWrapper: {
        zIndex: 1000,
        marginBottom: 20,
    },
    dropdown: {
        borderColor: '#D1D5DB',
    },
    button: {
        backgroundColor: '#FD7622',
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
