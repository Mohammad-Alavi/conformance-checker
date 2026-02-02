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
                placeholder="e.g., OBJ-CLARITY-001"
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
                prepend-inner-icon="mdi-shape"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.title"
            label="Rule Title"
            placeholder="e.g., Titles must be clear and concise"
            :rules="[rules.required, rules.minLength(10)]"
            class="mt-2"
            prepend-inner-icon="mdi-format-title"
          />

          <v-textarea
            v-model="form.description"
            label="Description"
            placeholder="Detailed explanation of what this rule checks for..."
            :rules="[rules.required, rules.minLength(20)]"
            rows="3"
            auto-grow
            class="mt-2"
            prepend-inner-icon="mdi-text"
          />

          <!-- Classification Section -->
          <div class="section-header mt-6 mb-3">
            <v-icon size="20" class="mr-2" color="primary">mdi-tag-multiple</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Classification</span>
          </div>

          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.category"
                label="Category"
                :items="categories"
                :rules="[rules.required]"
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
              <v-text-field
                v-model="form.target_field"
                label="Target Field"
                placeholder="e.g., title, description"
                :rules="[rules.required]"
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
                :rules="[rules.required, rules.positiveNumber]"
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
                clearable
                prepend-inner-icon="mdi-auto-fix"
              />
            </v-col>
          </v-row>

          <!-- Examples Section -->
          <div class="section-header mt-6 mb-3">
            <v-icon size="20" class="mr-2" color="primary">mdi-lightbulb</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Examples</span>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <div class="d-flex align-center mb-2">
                <v-icon color="success" size="small" class="mr-2">mdi-check-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Good Examples</span>
                <v-spacer />
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="success"
                  @click="addExample('good')"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  Add
                </v-btn>
              </div>
              <div v-for="(_, index) in form.good_examples" :key="'good-' + index" class="mb-2">
                <v-text-field
                  v-model="form.good_examples[index]"
                  :label="`Example ${index + 1}`"
                  density="compact"
                  hide-details
                >
                  <template #append>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeExample('good', index)"
                      :disabled="form.good_examples.length <= 1"
                    >
                      <v-icon size="small">mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="d-flex align-center mb-2">
                <v-icon color="error" size="small" class="mr-2">mdi-close-circle</v-icon>
                <span class="text-body-2 font-weight-medium">Bad Examples</span>
                <v-spacer />
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="error"
                  @click="addExample('bad')"
                >
                  <v-icon start size="small">mdi-plus</v-icon>
                  Add
                </v-btn>
              </div>
              <div v-for="(_, index) in form.bad_examples" :key="'bad-' + index" class="mb-2">
                <v-text-field
                  v-model="form.bad_examples[index]"
                  :label="`Example ${index + 1}`"
                  density="compact"
                  hide-details
                >
                  <template #append>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeExample('bad', index)"
                      :disabled="form.bad_examples.length <= 1"
                    >
                      <v-icon size="small">mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </div>
            </v-col>
          </v-row>

          <!-- Validation Hint -->
          <div class="section-header mt-6 mb-3">
            <v-icon size="20" class="mr-2" color="primary">mdi-tooltip-check</v-icon>
            <span class="text-subtitle-1 font-weight-medium">Validation Hint</span>
          </div>

          <v-textarea
            v-model="form.validation_hint"
            label="Validation Hint"
            placeholder="Guidance for the AI on how to check this rule..."
            rows="2"
            auto-grow
            prepend-inner-icon="mdi-information-outline"
          />
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
  category: 'Clarity',
  severity: 'medium',
  weight: 1.0,
  title: '',
  description: '',
  good_examples: [''],
  bad_examples: [''],
  validation_hint: '',
  quick_fix_type: 'suggestion',
})

const form = ref(defaultForm())

// Options
const contentTypes = [
  { title: 'Objective', value: 'objective' },
  { title: 'Goal', value: 'goal' },
]

const categories = [
  'Clarity',
  'Measurability',
  'Achievability',
  'Relevance',
  'Time-Bound',
  'Specificity',
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

const quickFixTypes = [
  { title: 'Suggestion', value: 'suggestion' },
  { title: 'Auto-fix', value: 'autofix' },
  { title: 'Manual', value: 'manual' },
]

// Validation rules
const rules = {
  required: v => (v !== null && v !== undefined && v !== '') || 'This field is required',
  ruleId: v => /^[A-Z]{2,5}-[A-Z]+-\d{3}$/.test(v) || 'Format: XXX-CATEGORY-000 (e.g., OBJ-CLARITY-001)',
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

function addExample(type) {
  if (type === 'good') {
    form.value.good_examples.push('')
  } else {
    form.value.bad_examples.push('')
  }
}

function removeExample(type, index) {
  if (type === 'good' && form.value.good_examples.length > 1) {
    form.value.good_examples.splice(index, 1)
  } else if (type === 'bad' && form.value.bad_examples.length > 1) {
    form.value.bad_examples.splice(index, 1)
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

  // Filter out empty examples
  const submitData = {
    ...form.value,
    good_examples: form.value.good_examples.filter(e => e.trim()),
    bad_examples: form.value.bad_examples.filter(e => e.trim()),
  }

  emit('save', submitData)
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
      good_examples: newRule.good_examples?.length ? [...newRule.good_examples] : [''],
      bad_examples: newRule.bad_examples?.length ? [...newRule.bad_examples] : [''],
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
