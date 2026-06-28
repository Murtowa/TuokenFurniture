<template>
  <div class="checkout-page">
    <div class="container">
      <h2 class="page-title">确认订单</h2>
      <div v-if="cartItems.length === 0 && !loading" class="empty-tip">
        <p>购物车为空，请先添加商品</p>
        <el-button type="primary" @click="$router.push('/cart')">返回购物车</el-button>
      </div>
      <div v-else class="checkout-container">
        <!-- 左：收货地址 -->
        <div class="checkout-section address-section">
          <div class="section-header">
            <h3>收货地址</h3>
            <el-button type="primary" link size="small" @click="openAddressDialog()">
              <el-icon><Plus /></el-icon> 新增地址
            </el-button>
          </div>
          <div v-loading="addressLoading" class="address-list">
            <div v-if="addresses.length === 0" class="empty-hint">暂无收货地址，请先添加</div>
            <div
              v-for="addr in addresses"
              :key="addr.id"
              class="address-item"
              :class="{ selected: selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <div class="addr-header">
                <span class="addr-name">{{ addr.receiver_name }}</span>
                <span class="addr-phone">{{ addr.phone }}</span>
                <el-tag v-if="addr.isDefault" size="small" class="default-tag">默认</el-tag>
              </div>
              <div class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</div>
            </div>
          </div>
        </div>

        <!-- 中：商品列表 -->
        <div class="checkout-section items-section">
          <div class="section-header">
            <h3>订单商品</h3>
          </div>
          <div class="items-list">
            <div v-for="item in cartItems" :key="item.id" class="order-item">
              <img :src="(item.main_image || item.image || '').startsWith('/uploads') ? (item.main_image || item.image) : '/uploads/' + (item.main_image || item.image)" alt="" class="item-img" loading="lazy" />
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-price-qty">
                  <span class="item-price">&yen;{{ item.price }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-subtotal">&yen;{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 右：订单摘要 -->
        <div class="checkout-section summary-section">
          <h3>订单摘要</h3>
          <div class="summary-row">
            <span>商品合计</span>
            <span class="summary-price">&yen;{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-remark">
            <p class="remark-label">订单备注</p>
            <el-input
              v-model="remark"
              type="textarea"
              :rows="3"
              placeholder="选填：如有特殊要求请在此备注"
            />
          </div>
          <div class="summary-total-shipping">
            配送: <span>免运费</span>
          </div>
          <div class="summary-total">
            <span>应付总额</span>
            <span class="total-amount">&yen;{{ totalPrice.toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="large" style="width:100%;" :loading="submitting" @click="submitOrder">
            提交订单
          </el-button>
        </div>
      </div>
    </div>

    <!-- 新增地址弹窗 -->
    <el-dialog v-model="addressDialogVisible" :title="editingAddress ? '编辑地址' : '新增地址'" width="520px" destroy-on-close>
      <el-form ref="addrFormRef" :model="addrForm" :rules="addrRules" label-width="80px">
        <el-form-item label="收货人" prop="receiver_name">
          <el-input v-model="addrForm.receiver_name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addrForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省/市/区" prop="province">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-input v-model="addrForm.province" placeholder="省" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="addrForm.city" placeholder="市" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="addrForm.district" placeholder="区" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addrForm.detail" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="addrForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingAddr" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>

    <!-- 支付确认弹窗 -->
    <el-dialog :model-value="!!pendingPayment" @update:model-value="val => { if (!val) pendingPayment = null }" title="确认支付" width="400px" :close-on-click-modal="false" destroy-on-close>
      <div v-if="pendingPayment" class="pay-dialog-body">
        <div class="pay-row">
          <span>订单号</span>
          <span class="pay-order-no">{{ pendingPayment.orderNo }}</span>
        </div>
        <div class="pay-row">
          <span>应付金额</span>
          <span class="pay-amount">&yen;{{ pendingPayment.totalAmount }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleSkipPay">稍后支付</el-button>
        <el-button type="primary" :loading="paying" @click="handleConfirmPay">确认支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import * as userApi from '@/api/user'
import * as orderApi from '@/api/order'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const cartItems = computed(() => {
  if (!cartStore.selectedIds || cartStore.selectedIds.length === 0) {
    return cartStore.items
  }
  const idSet = new Set(cartStore.selectedIds)
  return cartStore.items.filter(item => idSet.has(item.id) || idSet.has(item.product_id))
})
const totalPrice = computed(() => cartItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

const remark = ref('')
const submitting = ref(false)
const loading = ref(false)
const pendingPayment = ref(null)
const paying = ref(false)

// 地址相关
const addresses = ref([])
const selectedAddressId = ref(null)
const addressLoading = ref(false)
const addressDialogVisible = ref(false)
const savingAddr = ref(false)
const editingAddress = ref(null)
const addrFormRef = ref(null)

const addrForm = reactive({
  receiver_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const addrRules = {
  receiver_name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

async function fetchAddresses() {
  addressLoading.value = true
  try {
    addresses.value = await userApi.getAddresses()
    const def = addresses.value.find(a => a.isDefault)
    if (def) selectedAddressId.value = def.id
    else if (addresses.value.length > 0) selectedAddressId.value = addresses.value[0].id
  } finally {
    addressLoading.value = false
  }
}

function openAddressDialog(addr = null) {
  editingAddress.value = addr
  if (addr) {
    Object.assign(addrForm, {
      receiver_name: addr.receiver_name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: !!addr.isDefault
    })
  } else {
    Object.assign(addrForm, { receiver_name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false })
  }
  addressDialogVisible.value = true
}

async function saveAddress() {
  const valid = await addrFormRef.value.validate().catch(() => false)
  if (!valid) return
  savingAddr.value = true
  try {
    if (editingAddress.value) {
      await userApi.updateAddress(editingAddress.value.id, { ...addrForm })
      ElMessage.success('地址已更新')
    } else {
      await userApi.addAddress({ ...addrForm })
      ElMessage.success('地址已添加')
    }
    addressDialogVisible.value = false
    await fetchAddresses()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    savingAddr.value = false
  }
}

async function submitOrder() {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  const items = cartItems.value.map(item => ({
    productId: item.productId || item.product_id,
    quantity: item.quantity,
    price: item.price
  }))
  submitting.value = true
  try {
    const data = await orderStore.placeOrder({
      addressId: selectedAddressId.value,
      items,
      remark: remark.value
    })
    ElMessage.success('订单提交成功')
    cartStore.fetch()
    pendingPayment.value = {
      orderId: data.orderId,
      orderNo: data.orderNo,
      totalAmount: totalPrice.value.toFixed(2)
    }
  } catch (err) {
    const msg = err?.response?.data?.message || '提交订单失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}

async function handleConfirmPay() {
  paying.value = true
  try {
    await orderApi.payOrder(pendingPayment.value.orderId)
    ElMessage.success('支付成功')
    pendingPayment.value = null
    router.push('/user/orders')
  } catch {
    ElMessage.error('支付失败')
  } finally {
    paying.value = false
  }
}

function handleSkipPay() {
  pendingPayment.value = null
  router.push('/user/orders')
}

onMounted(async () => {
  loading.value = true
  try {
    await cartStore.fetch()
    await fetchAddresses()
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.checkout-page {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 24px 80px;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c2416;
  margin: 0 0 32px 0;
  position: relative;
  padding-bottom: 12px;
  letter-spacing: -0.02em;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background: #8B6914;
    border-radius: 1.5px;
  }
}

.checkout-container {
  display: grid;
  grid-template-columns: 1fr 1.2fr 0.8fr;
  gap: 24px;
  align-items: start;
}

.checkout-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 { margin: 0; font-size: 16px; color: #2c2416; font-weight: 600; letter-spacing: 0.02em; }
}

.address-item {
  padding: 14px 16px;
  border: 1px solid #f0ece5;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.2s;

  &.selected { border-color: #8B6914; background: #fdf6e8; }
  &:hover { border-color: #e8e3dc; }
}

.addr-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.addr-name { font-weight: 600; color: #2c2416; }
.addr-phone { color: #8c8170; font-size: 13px; letter-spacing: 0.02em; }
.addr-detail { color: #8c8170; font-size: 13px; letter-spacing: 0.02em; }
.default-tag { background: #fdf6e8; color: #8B6914; border-color: #f0ece5; }

.empty-hint { color: #b8af9e; text-align: center; padding: 20px 0; }
.empty-tip { text-align: center; padding: 80px 0; color: #b8af9e; }

.items-list { max-height: 500px; overflow-y: auto; }

.order-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f0ece5;

  &:last-child { border-bottom: none; }
}

.item-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  background: #faf8f5;
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }
.item-name {
  font-size: 14px;
  color: #2c2416;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.02em;
}
.item-price-qty { margin-top: 6px; display: flex; gap: 12px; align-items: center; }
.item-price { color: #c0392b; font-weight: 600; }
.item-qty { color: #b8af9e; font-size: 13px; }
.item-subtotal { color: #c0392b; font-weight: 600; font-size: 15px; white-space: nowrap; }

.summary-section h3 { margin: 0 0 20px 0; font-size: 16px; color: #2c2416; font-weight: 600; letter-spacing: 0.02em; }

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0ece5;
  font-size: 15px;
  color: #8c8170;
}

.summary-price { color: #c0392b; font-weight: 700; font-size: 18px; }

.summary-remark { margin: 16px 0; }
.remark-label { font-size: 14px; color: #8c8170; margin: 0 0 8px 0; letter-spacing: 0.02em; }

:deep(.el-textarea__inner) {
  border-radius: 8px;
  border-color: #e8e3dc;
  background: #faf8f5;
  &:focus {
    border-color: #8B6914;
  }
}

.summary-total-shipping {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #8c8170;
  border-top: 1px solid #f0ece5;
  span { color: #5b8c5a; }
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #f0ece5;
  margin-bottom: 20px;
  font-size: 16px;
  color: #2c2416;
  font-weight: 600;
  .total-amount {
    font-size: 28px;
    font-weight: 700;
    color: #c0392b;
  }
}

:deep(.el-button--primary) {
  background: #8B6914;
  border-color: #8B6914;
  border-radius: 8px;
  &:hover {
    background: #a68b3c;
    border-color: #a68b3c;
  }
}

:deep(.el-button--primary.is-link) {
  color: #8B6914;
  background: transparent;
  &:hover {
    color: #a68b3c;
  }
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e8e3dc;
  &:hover {
    box-shadow: 0 0 0 1px #c0b9a8;
  }
  &.is-focus {
    box-shadow: 0 0 0 1px #8B6914;
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
}

.pay-dialog-body {
  text-align: center;
  .pay-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 15px;
    color: #8c8170;
    & + .pay-row { border-top: 1px solid #f0ece5; }
  }
  .pay-order-no { color: #2c2416; font-weight: 500; }
  .pay-amount { color: #c0392b; font-weight: 700; font-size: 20px; }
}
</style>