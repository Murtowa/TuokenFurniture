<template>
  <div class="product-list">
    <div class="container">
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="content-wrapper">
        <!-- Sidebar Filter -->
        <aside class="sidebar">
          <div class="filter-section">
            <h3 class="filter-title">商品分类</h3>
            <ul class="category-list">
              <li
                class="category-item"
                :class="{ active: !filters.categoryId }"
                @click="handleCategoryFilter(null)"
              >
                全部分类
              </li>
              <template v-for="cat in categories" :key="cat.id">
                <li
                  class="category-item parent"
                  :class="{ active: filters.categoryId === cat.id }"
                  @click="handleCategoryFilter(cat.id)"
                >
                  {{ cat.name }}
                </li>
                <li
                  v-for="child in cat.children"
                  :key="child.id"
                  class="category-item child"
                  :class="{ active: filters.categoryId === child.id }"
                  @click="handleCategoryFilter(child.id)"
                >
                  {{ child.name }}
                </li>
              </template>
            </ul>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Toolbar -->
          <div class="toolbar">
            <el-input
              v-model="keyword"
              placeholder="搜索商品..."
              clearable
              :prefix-icon="Search"
              class="search-input"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
            <div class="sort-group">
              <el-radio-group v-model="sort" size="small" @change="handleSortChange">
                <el-radio-button value="default">默认</el-radio-button>
                <el-radio-button value="price_asc">价格升序</el-radio-button>
                <el-radio-button value="price_desc">价格降序</el-radio-button>
                <el-radio-button value="newest">最新</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="store.loading" class="loading-wrapper">
            <el-skeleton :rows="3" animated />
            <div class="loading-grid">
              <el-skeleton v-for="i in 12" :key="i" animated>
                <template #template>
                  <div class="skeleton-card">
                    <el-skeleton-item variant="image" style="width:100%;height:200px" />
                    <el-skeleton-item variant="text" style="width:80%;margin-top:12px" />
                    <el-skeleton-item variant="text" style="width:40%" />
                  </div>
                </template>
              </el-skeleton>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-else class="product-grid">
            <div
              v-for="product in store.list"
              :key="product.id"
              class="product-card"
              @click="goToDetail(product.id)"
            >
              <div class="card-image">
                <img :src="`/uploads/${product.main_image}`" :alt="product.name" />
                <div class="card-overlay">
                  <el-button
                    type="primary"
                    :icon="ShoppingCartFull"
                    round
                    @click.stop="handleAddCart(product)"
                  >
                    加入购物车
                  </el-button>
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ product.name }}</h3>
                <p class="card-category" v-if="product.category_name">{{ product.category_name }}</p>
                <p class="card-price">&yen;{{ product.price }}</p>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <el-empty v-if="!store.loading && store.list.length === 0" description="暂无商品" />

          <!-- Pagination -->
          <div v-if="store.total > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="filters.page"
              :page-size="filters.pageSize"
              :total="store.total"
              layout="prev, pager, next, total"
              background
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingCartFull } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { getCategories } from '@/api/product'

const router = useRouter()
const store = useProductStore()
const cartStore = useCartStore()

const categories = ref([])
const keyword = ref('')
const sort = ref('default')

const filters = computed(() => store.filters)

function goToDetail(id) {
  router.push(`/product/${id}`)
}

function handleCategoryFilter(categoryId) {
  store.setFilter('categoryId', categoryId)
}

function handleSearch() {
  store.setFilter('keyword', keyword.value || '')
}

function handleSortChange(val) {
  store.setFilter('sort', val)
}

function handlePageChange(page) {
  store.setFilter('page', page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleAddCart(product) {
  await cartStore.add(product.id, 1)
}

onMounted(async () => {
  store.fetchProducts()
  const catData = await getCategories()
  categories.value = catData || []
})
</script>

<style lang="scss" scoped>
.product-list {
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

  .content-wrapper {
    display: flex;
    gap: 24px;
  }

  /* Sidebar */
  .sidebar {
    flex-shrink: 0;
    width: 240px;
    .filter-section {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #f0ece5;
      .filter-title {
        font-size: 16px;
        font-weight: 600;
        color: #2c2416;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0ece5;
        letter-spacing: 0.02em;
      }
    }
    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
      .category-item {
        padding: 10px 12px;
        cursor: pointer;
        border-radius: 6px;
        font-size: 14px;
        color: #8c8170;
        letter-spacing: 0.02em;
        transition: all 0.2s;
        &:hover {
          color: #8B6914;
        }
        &.active {
          background: #fdf6e8;
          color: #8B6914;
          font-weight: 500;
        }
        &.parent {
          font-weight: 600;
          color: #2c2416;
          margin-top: 8px;
        }
        &.child {
          padding-left: 28px;
          font-size: 13px;
        }
      }
    }
  }

  /* Main Content */
  .main-content {
    flex: 1;
    min-width: 0;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
    .search-input {
      width: 300px;
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
    }
    :deep(.el-radio-group) {
      .el-radio-button__inner {
        border-color: #e8e3dc;
        color: #8c8170;
        &:hover {
          color: #8B6914;
        }
      }
      .el-radio-button.is-active .el-radio-button__inner {
        background: #8B6914;
        border-color: #8B6914;
        color: #fff;
      }
    }
  }

  .loading-wrapper {
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 24px;
      .skeleton-card {
        padding: 0;
      }
    }
  }

  /* Product Grid */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(44, 36, 22, 0.08);
    }
    .card-image {
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
      .card-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        background: linear-gradient(transparent, rgba(44, 36, 22, 0.5));
        display: flex;
        justify-content: center;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
      }
      &:hover .card-overlay {
        opacity: 1;
        transform: translateY(0);
      }
      :deep(.el-button--primary) {
        background: #8B6914;
        border-color: #8B6914;
        border-radius: 20px;
        &:hover {
          background: #a68b3c;
          border-color: #a68b3c;
        }
      }
    }
    .card-body {
      padding: 16px;
      .card-name {
        font-size: 15px;
        font-weight: 500;
        color: #2c2416;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.02em;
      }
      .card-category {
        font-size: 12px;
        color: #b8af9e;
        margin-bottom: 6px;
      }
      .card-price {
        font-size: 18px;
        font-weight: 700;
        color: #c0392b;
        margin: 0;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-bottom: 20px;
    :deep(.el-pagination.is-background) {
      .el-pager li.is-active {
        background-color: #8B6914;
      }
      .el-pager li:hover {
        color: #8B6914;
      }
    }
  }
}
</style>
