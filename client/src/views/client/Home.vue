<template>
  <div class="home">
    <!-- Banner Section -->
    <section class="banner-section">
      <el-carousel height="520px" :interval="5000" arrow="hover">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div
            class="banner-item"
            :style="{ backgroundImage: `url(/uploads/${banner.image})` }"
          >
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p v-if="banner.subtitle">{{ banner.subtitle }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- Category Section -->
    <section class="category-section section">
      <div class="container">
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
      </div>
    </section>

    <!-- Hot Products Section -->
    <section class="hot-section section">
      <div class="container">
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
              <p class="product-price">&yen;{{ product.price }}</p>
            </div>
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
    :deep(.el-carousel__container) {
      height: 520px;
    }
    :deep(.el-carousel__arrow) {
      background: rgba(44, 36, 22, 0.3);
      color: #fff;
      &:hover {
        background: rgba(44, 36, 22, 0.6);
      }
    }
    :deep(.el-carousel__indicator .el-carousel__button) {
      background: rgba(44, 36, 22, 0.3);
    }
    :deep(.el-carousel__indicator.is-active .el-carousel__button) {
      background: #8B6914;
    }
    .banner-item {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      .banner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(44, 36, 22, 0.2), rgba(44, 36, 22, 0.5));
      }
      .banner-content {
        position: relative;
        text-align: center;
        color: #fff;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        h2 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        p {
          font-size: 20px;
          opacity: 0.92;
          letter-spacing: 0.02em;
        }
      }
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c2416;
    margin-bottom: 40px;
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

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .section-title {
      margin-bottom: 40px;
    }
    :deep(.el-button.is-text) {
      color: #8c8170;
      &:hover {
        color: #8B6914;
      }
    }
  }

  /* Category */
  .category-section {
    background: #faf8f5;
  }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px;
  }
  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 16px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #f0ece5;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(44, 36, 22, 0.08);
      border-color: #e8e3dc;
    }
    .category-icon {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fdf6e8;
      border-radius: 50%;
      margin-bottom: 12px;
      color: #8B6914;
      img {
        width: 52px;
        height: 52px;
        object-fit: cover;
        border-radius: 50%;
      }
    }
    .category-name {
      font-size: 14px;
      color: #2c2416;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
  }

  /* Hot Products */
  .hot-section {
    background: #fff;
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  .product-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #f0ece5;
    &:hover {
      box-shadow: 0 4px 16px rgba(44, 36, 22, 0.08);
      transform: translateY(-2px);
      .product-actions {
        opacity: 1;
      }
    }
    .product-image {
      position: relative;
      width: 100%;
      padding-top: 100%;
      overflow: hidden;
      background: #faf8f5;
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
        transition: opacity 0.3s ease;
        :deep(.el-button--primary) {
          background: #8B6914;
          border-color: #8B6914;
          box-shadow: 0 2px 8px rgba(44, 36, 22, 0.3);
          &:hover {
            background: #a68b3c;
            border-color: #a68b3c;
          }
        }
      }
    }
    .product-info {
      padding: 24px;
      .product-name {
        font-size: 15px;
        font-weight: 500;
        color: #2c2416;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.02em;
      }
      .product-price {
        font-size: 18px;
        font-weight: 700;
        color: #c0392b;
        margin: 0;
      }
    }
  }
}
</style>
