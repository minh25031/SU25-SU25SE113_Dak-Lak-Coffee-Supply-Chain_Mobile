import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, TextInput } from 'react-native-paper';

import Background from '@/components/Background';
import Header from '@/components/Header';
import { ProcessingBatch, createWarehouseInboundRequest, getProcessingBatchesForFarmer } from '@/core/api/warehouseRequest.api';

export default function CreateWarehouseRequestScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProcessingBatch | null>(null);
  const [quantity, setQuantity] = useState('');
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const batchList = await getProcessingBatchesForFarmer();
      setBatches(batchList);
    } catch (error) {
      console.error('Lỗi tải danh sách lô xử lý:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBatch || !quantity) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (parseFloat(quantity) <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      setLoading(true);
             await createWarehouseInboundRequest({
         batchId: selectedBatch.batchId,
         requestedQuantity: parseFloat(quantity),
         preferredDeliveryDate: format(preferredDeliveryDate, 'yyyy-MM-dd'),
         note: note || undefined,
       });
      
      alert('Tạo yêu cầu nhập kho thành công!');
      router.back();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Chưa bắt đầu';
      case 1: return 'Đang xử lý';
      case 2: return 'Hoàn tất';
      case 3: return 'Đã huỷ';
      default: return 'Không xác định';
    }
  };

  return (
    <Background>
      <Header title="Tạo yêu cầu nhập kho" showBack />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>📋 Hướng dẫn</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Chọn lô xử lý đã hoàn tất</Text>
              <Text style={styles.infoItem}>• Nhập số lượng cần nhập kho</Text>
              <Text style={styles.infoItem}>• Chọn ngày giao dự kiến</Text>
              <Text style={styles.infoItem}>• Thêm ghi chú nếu cần</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Main Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📦 Thông tin yêu cầu nhập kho</Text>
            
            {/* Số lượng */}
            <Text style={styles.label}>⚖️ Số lượng (kg) *</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Nhập số lượng cần nhập kho"
              style={styles.input}
            />
                         <Text style={styles.helperText}>Nhập số lượng bạn muốn nhập kho</Text>

            {/* Ngày giao */}
            <Text style={styles.label}>📅 Ngày giao dự kiến *</Text>
            <Button
              mode="outlined"
              onPress={() => setShowDeliveryDatePicker(true)}
              style={styles.dateButton}
              icon="calendar"
            >
              {formatDate(preferredDeliveryDate)}
            </Button>
            <Text style={styles.helperText}>Chọn ngày từ hôm nay trở đi</Text>

            {/* Ghi chú */}
            <Text style={styles.label}>📝 Ghi chú</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Thông tin thêm về yêu cầu nhập kho (không bắt buộc)"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
            <Text style={styles.helperText}>Mô tả chi tiết về yêu cầu nếu cần</Text>

            {/* Chọn lô xử lý */}
            <Text style={styles.label}>☕ Chọn lô xử lý *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.batchContainer}>
              {batches.map((batch) => (
                <Chip
                  key={batch.batchId}
                  selected={selectedBatch?.batchId === batch.batchId}
                  onPress={() => setSelectedBatch(batch)}
                  style={styles.batchChip}
                  textStyle={styles.batchText}
                >
                  {batch.batchCode}
                </Chip>
              ))}
            </ScrollView>
            <Text style={styles.helperText}>Chỉ hiển thị các lô đã hoàn tất xử lý</Text>

            {selectedBatch && (
              <View style={styles.batchInfo}>
                <Text style={styles.batchInfoText}>📋 Mã lô: {selectedBatch.batchCode}</Text>
                <Text style={styles.batchInfoText}>🌱 Loại cà phê: {selectedBatch.typeName || 'N/A'}</Text>
                <Text style={styles.batchInfoText}>📊 Số lượng đã xử lý: {selectedBatch.totalOutputQuantity} kg</Text>
                <Text style={styles.batchInfoText}>✅ Trạng thái: {getStatusLabel(selectedBatch.status)}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            buttonColor="#FD7622"
          >
            {loading ? 'Đang gửi yêu cầu...' : '📦 Gửi yêu cầu nhập kho'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.backButton}
            textColor="#6B7280"
            buttonColor="transparent"
            icon="arrow-left"
          >
            Quay lại
          </Button>
        </View>
      </ScrollView>

      {showDeliveryDatePicker && (
        <DateTimePicker
          value={preferredDeliveryDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDeliveryDatePicker(false);
            if (selectedDate) {
              setPreferredDeliveryDate(selectedDate);
            }
          }}
        />
      )}
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  infoList: {
    gap: 6,
  },
  infoItem: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
  },
  batchContainer: {
    marginBottom: 16,
  },
  batchChip: {
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderColor: '#F59E0B',
  },
  batchText: {
    color: '#374151',
  },
  batchInfo: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  batchInfoText: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
  },
  dateButton: {
    marginBottom: 16,
    borderColor: '#F59E0B',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
  },
  actionButtons: {
    gap: 12,
    marginTop: 16,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButton: {
    borderColor: '#E5E7EB',
  },
});
