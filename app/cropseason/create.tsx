import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Snackbar } from 'react-native-paper';

import BackButton from '@/components/BackButton';
import { createCropSeason } from '@/core/api/cropSeason.api';
import { getAvailableCommitments, type FarmingCommitmentItem } from '@/core/api/FarmingCommitmentItem';

type DropdownItem = { label: string; value: string };

export default function CreateCropSeasonScreen() {
    const router = useRouter();

    const [form, setForm] = useState({
        seasonName: '',
        startDate: '',
        endDate: '',
        note: '',
        commitmentId: '',
    });

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

    const parseDateInput = (input: string): string => {
        const [day, month, year] = input.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const parseDate = (input: string): Date => {
        const [day, month, year] = input.split('/');
        return new Date(`${year}-${month}-${day}`);
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

        const [day, month, year] = form.startDate.split('/');
        if (!year) return;

        const suggestedName = `Mùa vụ ${year}`;
        const shouldSuggest =
            form.seasonName.trim() === '' || form.seasonName.startsWith('Mùa vụ');

        if (shouldSuggest && form.seasonName !== suggestedName) {
            setForm((prev) => ({
                ...prev,
                seasonName: suggestedName,
            }));
        }
    }, [form.startDate]);

    const handleSubmit = async () => {
        const { seasonName, startDate, endDate, commitmentId } = form;

        if (!seasonName || !startDate || !endDate || !commitmentId) {
            showSnackbar('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        if (parseDate(startDate) >= parseDate(endDate)) {
            showSnackbar('Ngày bắt đầu phải trước ngày kết thúc.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createCropSeason({
                ...form,
                startDate: parseDateInput(form.startDate),
                endDate: parseDateInput(form.endDate),
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
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
                <TextInput
                    style={styles.input}
                    value={form.startDate}
                    onChangeText={(text) => setForm({ ...form, startDate: text })}
                    placeholder="DD/MM/YYYY"
                />

                <Text style={styles.label}>Ngày kết thúc *</Text>
                <TextInput
                    style={styles.input}
                    value={form.endDate}
                    onChangeText={(text) => setForm({ ...form, endDate: text })}
                    placeholder="DD/MM/YYYY"
                />

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
                                setForm((prev) => {
                                    const newValue =
                                        typeof callback === 'function' ? callback(prev.commitmentId) : callback;
                                    if (newValue === prev.commitmentId) return prev;
                                    return {
                                        ...prev,
                                        commitmentId: newValue,
                                    };
                                })
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
            </KeyboardAwareScrollView>

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
        </KeyboardAvoidingView>
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
        marginBottom: 16,
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
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    dropdownWrapper: {
        zIndex: 1000,
        marginBottom: 16,
    },
    dropdown: {
        borderColor: '#D1D5DB',
    },
    button: {
        backgroundColor: '#FD7622',
        paddingVertical: 14,
        borderRadius: 999,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
