<template>
  <div class="home">
    <!-- Banner Section -->
    <section class="banner-section">
      <el-carousel height="420px" :interval="5000" arrow="hover">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div
            class="banner-item"
            :style="{ backgroundImage: `url(/uploads/${banner.image})` }"
          >
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p v-if="banner.subtitle">{{ banner.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- Category Section -->
    <section class="category-section container">
      <h2 class="section-title">商品分类</h2>
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          @click="goToCategory(cat.id)"
        >
          <div class="category-icon">
            <img v-if="cat.image" :src="`/uploads/${cat.image}`" :alt="cat.name" />
            <el-icon v-else :size="36"><Folder /></el-icon>
          </div>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>
    </section>

    <!-- Hot Products Section -->
    <section class="hot-section container">
      <div class="section-header">
        <h2 class="section-title">热门商品</h2>
        <el-button text type="primary" @click="$router.push('/products')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="product-grid">
        <div
          v-for="product in hotProducts"
          :key="product.id"
          class="product-card"
          @click="goToProduct(product.id)"
        >
          <div class="product-image">
            <img :src="`/uploads/${product.main_image}`" :alt="product.name" />
            <div class="product-actions">
              <el-button
                type="primary"
                circle
                :icon="ShoppingCartFull"
                @click.stop="handleAddCart(product)"
              />
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">¥{{ product.price }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Folder, ShoppingCartFull } from '@element-plus/icons-vue'
import { getBanners, getCategories, getProducts } from '@/api/product'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const banners = ref([])
const categories = ref([])
const hotProducts = ref([])

function goToProduct(id) {
  router.push(`/product/${id}`)
}

function goToCategory(id) {
  router.push(`/products?categoryId=${id}`)
}

async function handleAddCart(product) {
  await cartStore.add(product.id, 1)
}

onMounted(async () => {
  const [bannerData, categoryData, productData] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ page: 1, pageSize: 8 })
  ])
  banners.value = bannerData || []
  categories.value = categoryData || []
  hotProducts.value = productData.list || []
})
</script>

<style lang="scss" scoped>
.home {
  .banner-section {
    margin-bottom: 40px;
    :deep(.el-carousel__container) {
      height: 420px;
    }
    .banner-item {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      .banner-content {
        text-align: center;
        color: #fff;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        h2 {
          font-size: 36px;
          margin-bottom: 8px;
        }
        p {
          font-size: 18px;
          opacity: 0.9;
        }
      }
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 24px;
    position: relative;
    padding-left: 14px;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 4px;
      background: #409eff;
      border-radius: 2px;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .section-title {
      margin-bottom: 24px;
    }
  }

  /* Category */
  .category-section {
    margin-bottom: 48px;
  }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 12px;
    background: #f5f7fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background: #ecf5ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    }
    .category-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 50%;
      margin-bottom: 10px;
      color: #409eff;
      img {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 50%;
      }
    }
    .category-name {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }

  /* Hot Products */
  .hot-section {
    margin-bottom: 48px;
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .product-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #ebeef5;
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
      .product-actions {
        opacity: 1;
      }
    }
    .product-image {
      position: relative;
      width: 100%;
      padding-top: 100%;
      overflow: hidden;
      background: #f5f7fa;
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s;
      }
      &:hover img {
        transform: scale(1.05);
      }
      .product-actions {
        position: absolute;
        bottom: 12px;
        right: 12px;
        opacity: 0;
        transition: opacity 0.3s;
        .el-button {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      }
    }
    .product-info {
      padding: 14px;
      .product-name {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .product-price {
        font-size: 18px;
        font-weight: 700;
        color: #e74c3c;
      }
    }
  }
}
</style>
