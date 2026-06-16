<template>
  <div class="product-detail">
    <div class="container">
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
              <el-tag size="small" class="category-tag">{{ product.category_name }}</el-tag>
            </p>
            <div class="price-box">
              <span class="price-label">价格</span>
              <span class="price-value">&yen;{{ product.price }}</span>
            </div>
            <div class="stock-info">
              <span :class="['stock-status', product.stock > 0 ? 'in-stock' : 'out-stock']">
                <span class="status-dot" :class="product.stock > 0 ? 'in' : 'out'"></span>
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
                  size="large"
                  :disabled="!product.stock"
                  class="btn-buy-now"
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
    padding: 28px 24px;
  }

  .breadcrumb {
    margin-bottom: 24px;
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: #8c8170;
        font-weight: 400;
      }
      &:last-child .el-breadcrumb__inner {
        color: #2c2416;
        font-weight: 500;
      }
    }
    :deep(.el-breadcrumb__separator) {
      color: #b8af9e;
    }
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
    border-radius: 12px;
    padding: 32px;
    border: 1px solid #f0ece5;
  }

  /* Gallery */
  .gallery {
    flex: 1;
    max-width: 500px;
    .main-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 12px;
      overflow: hidden;
      background: #faf8f5;
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
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.3s;
        background: #faf8f5;
        &:hover {
          border-color: #8B6914;
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
      font-size: 28px;
      font-weight: 700;
      color: #2c2416;
      margin: 0 0 12px;
      line-height: 1.4;
      letter-spacing: -0.02em;
    }
    .product-category {
      margin-bottom: 16px;
      .category-tag {
        background: #fdf6e8;
        color: #8B6914;
        border: 1px solid #f0ece5;
        border-radius: 4px;
      }
    }
    .price-box {
      background: #fef5f5;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 16px;
      .price-label {
        font-size: 14px;
        color: #8c8170;
        margin-right: 12px;
        letter-spacing: 0.02em;
      }
      .price-value {
        font-size: 32px;
        font-weight: 700;
        color: #c0392b;
      }
    }
    .stock-info {
      margin-bottom: 20px;
      .stock-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        padding: 6px 14px;
        border-radius: 6px;
        letter-spacing: 0.02em;
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          &.in { background: #5b8c5a; }
          &.out { background: #c0392b; }
        }
        &.in-stock {
          color: #5b8c5a;
          background: #f0f9eb;
        }
        &.out-stock {
          color: #c0392b;
          background: #fef5f5;
        }
      }
    }
    .description {
      margin-bottom: 24px;
      h3 {
        font-size: 15px;
        font-weight: 600;
        color: #2c2416;
        margin-bottom: 8px;
        letter-spacing: 0.02em;
      }
      p {
        font-size: 14px;
        color: #8c8170;
        line-height: 1.8;
        margin: 0;
        letter-spacing: 0.02em;
      }
    }
    .action-box {
      padding-top: 24px;
      border-top: 1px solid #f0ece5;
      .quantity {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        .qty-label {
          font-size: 15px;
          color: #8c8170;
          margin-right: 16px;
          letter-spacing: 0.02em;
        }
      }
      .action-buttons {
        display: flex;
        gap: 12px;
        .btn-buy-now {
          border: 1px solid #2c2416;
          color: #2c2416;
          background: #fff;
          border-radius: 8px;
          &:hover {
            color: #8B6914;
            border-color: #8B6914;
          }
        }
      }
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

  :deep(.el-input-number) {
    .el-input__wrapper {
      border-radius: 8px;
    }
  }
}
</style>
