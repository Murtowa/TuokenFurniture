<template>
  <div class="product-detail container">
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/products' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrapper">
      <el-skeleton animated>
        <template #template>
          <div class="detail-skeleton">
            <div class="skeleton-left">
              <el-skeleton-item variant="image" style="width:100%;height:480px" />
            </div>
            <div class="skeleton-right">
              <el-skeleton-item variant="text" style="width:60%;height:32px" />
              <el-skeleton-item variant="text" style="width:30%;height:28px;margin-top:16px" />
              <el-skeleton-item variant="text" style="width:95%;margin-top:20px" />
              <el-skeleton-item variant="text" style="width:90%" />
              <el-skeleton-item variant="text" style="width:80%" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- Not Found -->
    <el-result
      v-else-if="notFound"
      icon="warning"
      title="商品不存在"
      sub-title="您查看的商品可能已下架或不存在"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/products')">返回商品列表</el-button>
      </template>
    </el-result>

    <!-- Content -->
    <template v-else-if="product.id">
      <div class="detail-wrapper">
        <!-- Left: Image Gallery -->
        <div class="gallery">
          <el-image
            :src="`/uploads/${product.main_image}`"
            :preview-src-list="allImages"
            :initial-index="0"
            fit="cover"
            class="main-image"
          />
          <div class="thumbnail-list" v-if="product.images && product.images.length">
            <el-image
              v-for="(img, idx) in product.images"
              :key="idx"
              :src="`/uploads/${img}`"
              :preview-src-list="allImages"
              :initial-index="idx + 1"
              fit="cover"
              class="thumbnail"
            />
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="info">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-category" v-if="product.category_name">
            <el-tag size="small" type="info">{{ product.category_name }}</el-tag>
          </p>
          <div class="price-box">
            <span class="price-label">价格</span>
            <span class="price-value">¥{{ product.price }}</span>
          </div>
          <div class="stock-info">
            <span :class="['stock-status', product.stock > 0 ? 'in-stock' : 'out-stock']">
              {{ product.stock > 0 ? `有货 (库存${product.stock}件)` : '暂时缺货' }}
            </span>
          </div>
          <div class="description" v-if="product.description">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>
          <div class="action-box">
            <div class="quantity">
              <span class="qty-label">数量</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock || 999"
                :disabled="!product.stock"
                size="large"
              />
            </div>
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :disabled="!product.stock"
                :icon="ShoppingCartFull"
                @click="handleAddCart"
              >
                加入购物车
              </el-button>
              <el-button
                type="danger"
                size="large"
                :disabled="!product.stock"
                @click="handleBuyNow"
              >
                立即购买
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCartFull } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref({})
const loading = ref(true)
const notFound = ref(false)
const quantity = ref(1)

const allImages = computed(() => {
  const imgs = [`/uploads/${product.value.main_image}`]
  if (product.value.images) {
    imgs.push(...product.value.images.map(img => `/uploads/${img}`))
  }
  return imgs
})

async function handleAddCart() {
  await cartStore.add(product.value.id, quantity.value)
}

function handleBuyNow() {
  cartStore.add(product.value.id, quantity.value).then(() => {
    router.push('/cart')
  })
}

async function fetchDetail() {
  loading.value = true
  notFound.value = false
  try {
    const id = route.params.id
    const data = await getProductDetail(id)
    if (!data || !data.id) {
      notFound.value = true
    } else {
      product.value = data
    }
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<style lang="scss" scoped>
.product-detail {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .breadcrumb {
    margin-bottom: 24px;
  }

  .loading-wrapper {
    .detail-skeleton {
      display: flex;
      gap: 40px;
      .skeleton-left {
        flex: 1;
        max-width: 500px;
      }
      .skeleton-right {
        flex: 1;
      }
    }
  }

  .detail-wrapper {
    display: flex;
    gap: 40px;
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    border: 1px solid #ebeef5;
  }

  /* Gallery */
  .gallery {
    flex: 1;
    max-width: 500px;
    .main-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f7fa;
      :deep(img) {
        object-fit: cover;
      }
    }
    .thumbnail-list {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      .thumbnail {
        width: 72px;
        height: 72px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.3s;
        background: #f5f7fa;
        &:hover {
          border-color: #409eff;
        }
        :deep(img) {
          object-fit: cover;
        }
      }
    }
  }

  /* Info */
  .info {
    flex: 1;
    .product-name {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 10px;
      line-height: 1.4;
    }
    .product-category {
      margin-bottom: 16px;
    }
    .price-box {
      background: #fef0f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 16px;
      .price-label {
        font-size: 14px;
        color: #909399;
        margin-right: 12px;
      }
      .price-value {
        font-size: 32px;
        font-weight: 700;
        color: #e74c3c;
      }
    }
    .stock-info {
      margin-bottom: 20px;
      .stock-status {
        font-size: 14px;
        padding: 4px 10px;
        border-radius: 4px;
        &.in-stock {
          color: #67c23a;
          background: #f0f9eb;
        }
        &.out-stock {
          color: #f56c6c;
          background: #fef0f0;
        }
      }
    }
    .description {
      margin-bottom: 24px;
      h3 {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }
      p {
        font-size: 14px;
        color: #606266;
        line-height: 1.8;
        margin: 0;
      }
    }
    .action-box {
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
      .quantity {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .qty-label {
          font-size: 15px;
          color: #606266;
          margin-right: 16px;
        }
      }
      .action-buttons {
        display: flex;
        gap: 12px;
      }
    }
  }
}
</style>
