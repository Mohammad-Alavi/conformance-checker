<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    persistent
    scrollable
  >
    <v-card class="rule-form-card">
      <v-card-title class="d-flex align-center pa-4 pb-2">
        <v-icon :color="isEditing ? 'warning' : 'primary'" class="mr-3" size="28">
          {{ isEditing ? 'mdi-pencil' : 'mdi-plus-circle' }}
        </v-icon>
        <span class="text-h5">{{ isEditing ? 'Edit Rule' : 'Create New Rule' }}</span>
        <v-spacer />
        <v-btn icon variant="text" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
          <!-- Basic Info Section -->
          <div class="section-header mb-3">
            <v-icon size="20" class="mr-2" color="primary">mdi-information</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Basic Information</span>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.rule_id"
                label="Rule ID"
                placeholder="e.g., OBJ-001 or GOAL-002"
                :rules="[rules.required, rules.ruleId]"
                :disabled="isEditing"
                hint="Unique identifier (cannot be changed after creation)"
                persistent-hint
                prepend-inner-icon="mdi-identifier"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.content_type"
                label="Content Type"
                :items="contentTypes"
                :rules="[rules.required]"
                :disabled="isEditing"
                prepend-inner-icon="mdi-shape"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.title"
            label="Rule Title"
            placeholder="e.g., Must specify time period"
            :rules="[rules.required, rules.minLength(5)]"
            class="mt-2"
            prepend-inner-icon="mdi-format-title"
          />

          <v-textarea
            v-model="form.description"
            label="Description"
            placeholder="Detailed explanation of what this rule checks for..."
            rows="3"
            auto-grow
            class="mt-2"
            prepend-inner-icon="mdi-text"
          />

          <!-- Classification Section -->
          <div class="section-header mt-6 mb-3">
            <v-icon size="20" class="mr-2" color="primary">mdi-tag-multiple</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Classification</span>
            <v-chip v-if="isEditing" size="x-small" color="warning" variant="tonal" class="ml-2">
              Some fields read-only
            </v-chip>
          </div>

          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.category"
                label="Category"
                :items="categories"
                :disabled="isEditing"
                prepend-inner-icon="mdi-folder"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.severity"
                label="Severity"
                :items="severityLevels"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-alert-circle"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :color="getSeverityColor(item.value)" size="small">
                        {{ getSeverityIcon(item.value) }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.target_field"
                label="Target Field"
                :items="targetFields"
                :disabled="isEditing"
                prepend-inner-icon="mdi-target"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.weight"
                label="Weight"
                type="number"
                step="0.1"
                min="0"
                max="10"
                :rules="[rules.positiveNumber]"
                :disabled="isEditing"
                hint="Importance factor (0.0 - 10.0)"
                persistent-hint
                prepend-inner-icon="mdi-scale-balance"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.quick_fix_type"
                label="Quick Fix Type"
                :items="quickFixTypes"
                :disabled="isEditing"
                clearable
                prepend-inner-icon="mdi-auto-fix"
              />
            </v-col>
          </v-row>

          <!-- Validation Hint (only for create) -->
          <template v-if="!isEditing">
            <div class="section-header mt-6 mb-3">
              <v-icon size="20" class="mr-2" color="primary">mdi-tooltip-check</v-icon>
              <span class="text-subtitle-1 font-weight-medium">Validation Hint</span>
            </div>

            <v-textarea
              v-model="form.validation_hint"
              label="Validation Hint"
              placeholder="Guidance for the AI on how to check this rule (e.g., 'Look for dates, years, deadlines...')"
              rows="2"
              auto-grow
              prepend-inner-icon="mdi-information-outline"
            />
          </template>

          <!-- Read-only info for editing -->
          <template v-if="isEditing && form.version">
            <div class="section-header mt-6 mb-3">
              <v-icon size="20" class="mr-2" color="primary">mdi-information-outline</v-icon>
              <span class="text-subtitle-1 font-weight-medium">Rule Metadata</span>
            </div>

            <v-row>
              <v-col cols="12" sm="4">
                <v-text-field
                  :model-value="form.version"
                  label="Version"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-tag"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  :model-value="formatDate(form.created_at)"
                  label="Created"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-plus"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  :model-value="formatDate(form.updated_at)"
                  label="Last Updated"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-edit"
                />
              </v-col>
            </v-row>
          </template>

          <!-- Examples display (read-only in edit mode) -->
          <template v-if="isEditing && (form.good_examples?.length || form.bad_examples?.length)">
            <div class="section-header mt-6 mb-3">
              <v-icon size="20" class="mr-2" color="primary">mdi-lightbulb</v-icon>
              <span class="text-subtitle-1 font-weight-medium">Examples</span>
              <v-chip size="x-small" color="info" variant="tonal" class="ml-2">
                Read-only
              </v-chip>
            </div>

            <v-row>
              <v-col v-if="form.good_examples?.length" cols="12" md="6">
                <div class="d-flex align-center mb-2">
                  <v-icon color="success" size="small" class="mr-2">mdi-check-circle</v-icon>
                  <span class="text-body-2 font-weight-medium">Good Examples</span>
                </div>
                <div v-for="(example, index) in form.good_examples" :key="'good-' + index" class="text-body-2 text-success mb-1 ml-6">
                  "{{ example }}"
                </div>
              </v-col>

              <v-col v-if="form.bad_examples?.length" cols="12" md="6">
                <div class="d-flex align-center mb-2">
                  <v-icon color="error" size="small" class="mr-2">mdi-close-circle</v-icon>
                  <span class="text-body-2 font-weight-medium">Bad Examples</span>
                </div>
                <div v-for="(example, index) in form.bad_examples" :key="'bad-' + index" class="text-body-2 text-error mb-1 ml-6">
                  "{{ example }}"
                </div>
              </v-col>
            </v-row>
          </template>

          <!-- Edit mode notice -->
          <v-alert
            v-if="isEditing"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <strong>Note:</strong> Only title, severity, and description can be updated. Other fields are read-only after creation.
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn variant="text" @click="handleClose">
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="isEditing"
          variant="tonal"
          color="error"
          @click="handleDelete"
          :loading="deleting"
        >
          <v-icon start>mdi-delete</v-icon>
          Delete Rule
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="saving"
          :disabled="!isFormValid"
        >
          <v-icon start>{{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Save Changes' : 'Create Rule' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  rule: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  deleting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const formRef = ref(null)
const isFormValid = ref(false)

const isEditing = computed(() => !!props.rule)

// Form data
const defaultForm = () => ({
  rule_id: '',
  content_type: 'objective',
  target_field: 'title',
  category: 'General',
  severity: 'medium',
  weight: 1.0,
  title: '',
  description: '',
  validation_hint: '',
  quick_fix_type: null,
  // Read-only fields (populated when editing)
  good_examples: [],
  bad_examples: [],
  version: '',
  created_at: '',
  updated_at: '',
})

const form = ref(defaultForm())

// Options
const contentTypes = [
  { title: 'Objective', value: 'objective' },
  { title: 'Goal', value: 'goal' },
]

const targetFields = [
  { title: 'Title', value: 'title' },
  { title: 'Description', value: 'description' },
]

const categories = [
  'General',
  'Time-bound',
  'Measurability',
  'Specificity',
  'Achievability',
  'Relevance',
  'Clarity',
  'Structure',
  'Language',
  'Completeness',
]

const severityLevels = [
  { title: 'Critical', value: 'critical' },
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' },
]

// Quick fix types per API spec
const quickFixTypes = [
  { title: 'Add Deadline', value: 'add_deadline' },
  { title: 'Add Quantity', value: 'add_quantity' },
  { title: 'Remove Deadline', value: 'remove_deadline' },
  { title: 'Remove Quantity', value: 'remove_quantity' },
  { title: 'Add Context', value: 'add_context' },
]

// Validation rules
const rules = {
  required: v => (v !== null && v !== undefined && v !== '') || 'This field is required',
  ruleId: v => /^[A-Z]+-\d{3}$/.test(v) || /^[A-Z]+-[A-Z]+-\d{3}$/.test(v) || 'Format: XXX-000 or XXX-CATEGORY-000 (e.g., OBJ-001)',
  minLength: min => v => (v && v.length >= min) || `Minimum ${min} characters required`,
  positiveNumber: v => (v !== null && v !== '' && v >= 0) || 'Must be a positive number',
}

// Helper functions
function getSeverityColor(severity) {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
  }
  return colors[severity] || 'grey'
}

function getSeverityIcon(severity) {
  const icons = {
    critical: 'mdi-alert-octagon',
    high: 'mdi-alert',
    medium: 'mdi-alert-circle',
    low: 'mdi-information',
  }
  return icons[severity] || 'mdi-help-circle'
}

function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

function resetForm() {
  form.value = defaultForm()
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

function handleClose() {
  emit('update:modelValue', false)
  setTimeout(resetForm, 300)
}

function handleSubmit() {
  if (!isFormValid.value) return

  if (isEditing.value) {
    // Only send updatable fields for update
    const submitData = {
      title: form.value.title,
      severity: form.value.severity,
      description: form.value.description,
    }
    emit('save', submitData)
  } else {
    // Send all fields for create
    const submitData = {
      rule_id: form.value.rule_id,
      content_type: form.value.content_type,
      severity: form.value.severity,
      title: form.value.title,
      target_field: form.value.target_field,
      category: form.value.category,
      weight: form.value.weight,
      description: form.value.description,
      validation_hint: form.value.validation_hint,
      quick_fix_type: form.value.quick_fix_type,
    }
    emit('save', submitData)
  }
}

function handleDelete() {
  emit('delete', form.value.rule_id)
}

// Watch for rule changes (editing mode)
watch(() => props.rule, (newRule) => {
  if (newRule) {
    form.value = {
      ...defaultForm(),
      ...newRule,
      // Parse weight if it's a string
      weight: parseFloat(newRule.weight) || 1.0,
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form when dialog closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    setTimeout(resetForm, 300)
  }
})
</script>

<style scoped>
.rule-form-card {
  border-radius: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
