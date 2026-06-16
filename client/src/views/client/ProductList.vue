<template>
  <div class="product-list container">
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
            <el-card shadow="hover" :body-style="{ padding: '0' }">
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
                <p class="card-price">¥{{ product.price }}</p>
              </div>
            </el-card>
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
    padding: 20px;
  }

  .breadcrumb {
    margin-bottom: 20px;
  }

  .content-wrapper {
    display: flex;
    gap: 24px;
  }

  /* Sidebar */
  .sidebar {
    flex-shrink: 0;
    width: 220px;
    .filter-section {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #ebeef5;
      .filter-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
      }
    }
    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
      .category-item {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
        color: #606266;
        transition: all 0.2s;
        &:hover {
          background: #ecf5ff;
          color: #409eff;
        }
        &.active {
          background: #409eff;
          color: #fff;
        }
        &.parent {
          font-weight: 600;
          margin-top: 6px;
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
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
    .search-input {
      width: 280px;
    }
  }

  .loading-wrapper {
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 20px;
      .skeleton-card {
        padding: 0;
      }
    }
  }

  /* Product Grid */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .product-card {
    cursor: pointer;
    transition: transform 0.3s;
    &:hover {
      transform: translateY(-4px);
    }
    :deep(.el-card) {
      transition: box-shadow 0.3s;
    }
    .card-image {
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
      .card-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
        display: flex;
        justify-content: center;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s;
      }
      &:hover .card-overlay {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .card-body {
      padding: 14px;
      .card-name {
        font-size: 15px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .card-category {
        font-size: 12px;
        color: #909399;
        margin-bottom: 6px;
      }
      .card-price {
        font-size: 18px;
        font-weight: 700;
        color: #e74c3c;
        margin: 0;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 32px;
    padding-bottom: 20px;
  }
}
</style>
