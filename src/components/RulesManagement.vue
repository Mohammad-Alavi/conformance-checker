<template>
  <div class="rules-management">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">
          <v-icon color="primary" class="mr-2">mdi-book-cog</v-icon>
          Rules Management
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          Manage conformance validation rules for objectives and goals
        </p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        @click="openCreateDialog"
      >
        <v-icon start>mdi-plus</v-icon>
        Create Rule
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="6" sm="3">
        <v-card variant="tonal" color="primary" class="stat-card pa-4">
          <div class="d-flex align-center">
            <v-avatar color="primary" variant="flat" size="40" class="mr-3">
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ rules.length }}</div>
              <div class="text-caption">Total Rules</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card variant="tonal" color="info" class="stat-card pa-4">
          <div class="d-flex align-center">
            <v-avatar color="info" variant="flat" size="40" class="mr-3">
              <v-icon>mdi-target</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ objectiveRules.length }}</div>
              <div class="text-caption">Objectives</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card variant="tonal" color="secondary" class="stat-card pa-4">
          <div class="d-flex align-center">
            <v-avatar color="secondary" variant="flat" size="40" class="mr-3">
              <v-icon>mdi-flag-checkered</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ goalRules.length }}</div>
              <div class="text-caption">Goals</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card variant="tonal" color="warning" class="stat-card pa-4">
          <div class="d-flex align-center">
            <v-avatar color="warning" variant="flat" size="40" class="mr-3">
              <v-icon>mdi-alert</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ criticalRulesCount }}</div>
              <div class="text-caption">Critical</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card variant="outlined" class="mb-6 pa-4 filter-card">
      <v-row align="center">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="searchQuery"
            label="Search rules"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="compact"
          />
        </v-col>
        <v-col cols="6" sm="3">
          <v-select
            v-model="filterType"
            label="Type"
            :items="typeOptions"
            clearable
            hide-details
            density="compact"
            prepend-inner-icon="mdi-filter"
          />
        </v-col>
        <v-col cols="6" sm="3">
          <v-select
            v-model="filterSeverity"
            label="Severity"
            :items="severityOptions"
            clearable
            hide-details
            density="compact"
            prepend-inner-icon="mdi-alert-circle"
          />
        </v-col>
        <v-col cols="12" sm="2">
          <v-btn
            variant="tonal"
            block
            @click="refreshRules"
            :loading="loading"
          >
            <v-icon start>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="clearError"
    >
      {{ error }}
    </v-alert>

    <!-- Loading State -->
    <div v-if="loading && !rules.length" class="text-center py-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
      <p class="text-body-1 mt-4 text-medium-emphasis">Loading rules...</p>
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="!loading && !rules.length"
      variant="outlined"
      class="text-center pa-12 empty-state"
    >
      <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-book-open-page-variant-outline</v-icon>
      <h3 class="text-h5 mb-2">No Rules Found</h3>
      <p class="text-body-1 text-medium-emphasis mb-4">
        Get started by creating your first conformance rule.
      </p>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon start>mdi-plus</v-icon>
        Create Your First Rule
      </v-btn>
    </v-card>

    <!-- No Results State -->
    <v-card
      v-else-if="!loading && rules.length && !filteredRules.length"
      variant="outlined"
      class="text-center pa-8"
    >
      <v-icon size="60" color="grey-lighten-1" class="mb-3">mdi-filter-off</v-icon>
      <h3 class="text-h6 mb-2">No Matching Rules</h3>
      <p class="text-body-2 text-medium-emphasis">
        Try adjusting your search or filter criteria.
      </p>
      <v-btn variant="text" @click="clearFilters" class="mt-2">
        Clear Filters
      </v-btn>
    </v-card>

    <!-- Rules Grid -->
    <template v-else>
      <div class="d-flex align-center justify-space-between mb-4">
        <span class="text-body-2 text-medium-emphasis">
          Showing {{ filteredRules.length }} of {{ rules.length }} rules
        </span>
        <v-btn-toggle v-model="viewMode" density="compact" variant="outlined" mandatory>
          <v-btn value="grid" size="small">
            <v-icon>mdi-view-grid</v-icon>
          </v-btn>
          <v-btn value="list" size="small">
            <v-icon>mdi-view-list</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Grid View -->
      <v-row v-if="viewMode === 'grid'">
        <v-col
          v-for="rule in filteredRules"
          :key="rule.rule_id"
          cols="12"
          sm="6"
          lg="4"
        >
          <RuleCard
            :rule="rule"
            @edit="openEditDialog"
            @delete="confirmDelete"
          />
        </v-col>
      </v-row>

      <!-- List View -->
      <v-card v-else variant="outlined">
        <v-list lines="two">
          <template v-for="(rule, index) in filteredRules" :key="rule.rule_id">
            <v-list-item @click="openEditDialog(rule)" class="py-3">
              <template #prepend>
                <v-chip
                  :color="getSeverityColor(rule.severity)"
                  size="small"
                  variant="flat"
                  class="mr-3"
                >
                  {{ rule.severity }}
                </v-chip>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ rule.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <span class="text-caption">{{ rule.rule_id }}</span>
                <span class="mx-2">•</span>
                <span>{{ rule.category }}</span>
                <span class="mx-2">•</span>
                <v-chip size="x-small" :color="rule.content_type === 'objective' ? 'primary' : 'secondary'" variant="tonal">
                  {{ rule.content_type }}
                </v-chip>
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click.stop="confirmDelete(rule)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-list-item>
            <v-divider v-if="index < filteredRules.length - 1" />
          </template>
        </v-list>
      </v-card>
    </template>

    <!-- Create/Edit Dialog -->
    <RuleFormDialog
      v-model="showFormDialog"
      :rule="editingRule"
      :saving="saving"
      :deleting="deleting"
      @save="handleSave"
      @delete="handleDelete"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete the rule "<strong>{{ ruleToDelete?.title }}</strong>"?
          This action will deactivate the rule.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="executeDelete"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="bottom right"
    >
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="showSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRulesApi } from '@/composables/useRulesApi'
import RuleCard from '@/components/RuleCard.vue'
import RuleFormDialog from '@/components/RuleFormDialog.vue'

const {
  loading,
  error,
  rules,
  objectiveRules,
  goalRules,
  fetchAllRules,
  createRule,
  updateRule,
  deleteRule,
  clearError,
} = useRulesApi()

// View state
const viewMode = ref('grid')
const searchQuery = ref('')
const filterType = ref(null)
const filterSeverity = ref(null)

// Dialog state
const showFormDialog = ref(false)
const editingRule = ref(null)
const saving = ref(false)

// Delete confirmation
const showDeleteDialog = ref(false)
const ruleToDelete = ref(null)
const deleting = ref(false)

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Filter options
const typeOptions = [
  { title: 'Objective', value: 'objective' },
  { title: 'Goal', value: 'goal' },
]

const severityOptions = [
  { title: 'Critical', value: 'critical' },
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' },
]

// Computed
const criticalRulesCount = computed(() =>
  rules.value.filter(r => r.severity === 'critical').length
)

const filteredRules = computed(() => {
  let result = rules.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(rule =>
      rule.title?.toLowerCase().includes(query) ||
      rule.description?.toLowerCase().includes(query) ||
      rule.rule_id?.toLowerCase().includes(query) ||
      rule.category?.toLowerCase().includes(query)
    )
  }

  // Filter by type
  if (filterType.value) {
    result = result.filter(rule => rule.content_type === filterType.value)
  }

  // Filter by severity
  if (filterSeverity.value) {
    result = result.filter(rule => rule.severity === filterSeverity.value)
  }

  return result
})

// Methods
function getSeverityColor(severity) {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }
  return colors[severity] || 'grey'
}

function clearFilters() {
  searchQuery.value = ''
  filterType.value = null
  filterSeverity.value = null
}

function refreshRules() {
  fetchAllRules()
}

function openCreateDialog() {
  editingRule.value = null
  showFormDialog.value = true
}

function openEditDialog(rule) {
  editingRule.value = { ...rule }
  showFormDialog.value = true
}

function confirmDelete(rule) {
  ruleToDelete.value = rule
  showDeleteDialog.value = true
}

async function handleSave(formData) {
  saving.value = true

  try {
    if (editingRule.value) {
      // Update existing rule
      await updateRule(editingRule.value.rule_id, formData)
      showNotification('Rule updated successfully', 'success')
    } else {
      // Create new rule
      await createRule(formData)
      showNotification('Rule created successfully', 'success')
    }
    showFormDialog.value = false
    // Refresh to get latest data
    await fetchAllRules()
  } catch (e) {
    showNotification(e.message || 'Failed to save rule', 'error')
  } finally {
    saving.value = false
  }
}

async function handleDelete(ruleId) {
  ruleToDelete.value = rules.value.find(r => r.rule_id === ruleId)
  showFormDialog.value = false
  showDeleteDialog.value = true
}

async function executeDelete() {
  if (!ruleToDelete.value) return

  deleting.value = true

  try {
    await deleteRule(ruleToDelete.value.rule_id)
    showNotification('Rule deleted successfully', 'success')
    showDeleteDialog.value = false
    ruleToDelete.value = null
  } catch (e) {
    showNotification(e.message || 'Failed to delete rule', 'error')
  } finally {
    deleting.value = false
  }
}

function showNotification(message, color = 'success') {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  fetchAllRules()
})
</script>

<style scoped>
.rules-management {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  border-radius: 12px;
}

.filter-card {
  border-radius: 12px;
}

.empty-state {
  border-radius: 16px;
  border-style: dashed;
}
</style>
