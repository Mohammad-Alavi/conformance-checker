/**
 * Composable for interacting with the n8n Rules Management API
 * CRUD operations for conformance rules (objectives and goals)
 *
 * API Endpoints:
 * - Collection: /webhook/collection/api/v1/rules (LIST, CREATE)
 * - Item: /webhook/item/api/v1/rules/{rule_id} (GET, UPDATE, DELETE)
 */
import { ref, computed } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://n8n.mohammadalavi.com'
const API_TOKEN = import.meta.env.VITE_API_TOKEN || ''

export function useRulesApi() {
  const loading = ref(false)
  const error = ref(null)
  const rules = ref([])
  const currentRule = ref(null)

  // Computed properties
  const objectiveRules = computed(() =>
    rules.value.filter(r => r.content_type === 'objective')
  )

  const goalRules = computed(() =>
    rules.value.filter(r => r.content_type === 'goal')
  )

  const rulesByCategory = computed(() => {
    const grouped = {}
    rules.value.forEach(rule => {
      const category = rule.category || 'Uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(rule)
    })
    return grouped
  })

  /**
   * Common fetch wrapper with auth
   */
  async function apiFetch(endpoint, options = {}) {
    const headers = {
      ...options.headers,
    }

    // Only add Content-Type for requests with body
    if (options.body) {
      headers['Content-Type'] = 'application/json'
    }

    // Only add Authorization header if token is configured
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }
    return null
  }

  /**
   * List all rules by type
   * GET /webhook/collection/api/v1/rules?type={content_type}
   * @param {'objective' | 'goal'} type - The rule type to fetch
   */
  async function listRules(type = 'objective') {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch(`/webhook/collection/api/v1/rules?type=${type}`)

      // Response format: { content_type, count, rules: [...] }
      const newRules = data.rules || []

      // Merge with existing rules of different type
      const otherTypeRules = rules.value.filter(r => r.content_type !== type)
      rules.value = [...otherTypeRules, ...newRules]

      return newRules
    } catch (e) {
      error.value = e.message || 'Failed to fetch rules'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all rules (both types)
   */
  async function fetchAllRules() {
    loading.value = true
    error.value = null

    try {
      const [objectiveData, goalData] = await Promise.all([
        apiFetch('/webhook/collection/api/v1/rules?type=objective'),
        apiFetch('/webhook/collection/api/v1/rules?type=goal'),
      ])

      // Response format: { content_type, count, rules: [...] }
      const objectiveRulesList = objectiveData.rules || []
      const goalRulesList = goalData.rules || []

      rules.value = [...objectiveRulesList, ...goalRulesList]
      return rules.value
    } catch (e) {
      error.value = e.message || 'Failed to fetch rules'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a single rule by ID
   * GET /webhook/item/api/v1/rules/{rule_id}
   * @param {string} ruleId - The rule ID (e.g., 'OBJ-001')
   */
  async function getRule(ruleId) {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch(`/webhook/item/api/v1/rules/${ruleId}`)
      // Response format: { rule: {...} }
      currentRule.value = data.rule || data
      return currentRule.value
    } catch (e) {
      error.value = e.message || 'Failed to fetch rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new rule
   * POST /webhook/collection/api/v1/rules
   * @param {Object} ruleData - The rule data
   */
  async function createRule(ruleData) {
    loading.value = true
    error.value = null

    try {
      // Prepare request body according to API spec
      const requestBody = {
        rule_id: ruleData.rule_id,
        content_type: ruleData.content_type,
        severity: ruleData.severity,
        title: ruleData.title,
        target_field: ruleData.target_field || 'title',
        category: ruleData.category || 'General',
        weight: ruleData.weight || 1.0,
        description: ruleData.description || '',
        validation_hint: ruleData.validation_hint || '',
        quick_fix_type: ruleData.quick_fix_type || null,
      }

      const data = await apiFetch('/webhook/collection/api/v1/rules', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Response format: { message: "Rule created", rule: {...} }
      const createdRule = data.rule || data
      if (createdRule) {
        rules.value.push(createdRule)
      }

      return createdRule
    } catch (e) {
      error.value = e.message || 'Failed to create rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing rule
   * PUT /webhook/item/api/v1/rules/{rule_id}
   * Only title, severity, and description can be updated
   * @param {string} ruleId - The rule ID
   * @param {Object} updates - The fields to update (title, severity, description)
   */
  async function updateRule(ruleId, updates) {
    loading.value = true
    error.value = null

    try {
      // Only send updatable fields according to API spec
      const requestBody = {}
      if (updates.title !== undefined) requestBody.title = updates.title
      if (updates.severity !== undefined) requestBody.severity = updates.severity
      if (updates.description !== undefined) requestBody.description = updates.description

      const data = await apiFetch(`/webhook/item/api/v1/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      })

      // Response format: { message: "Rule updated", rule: {...} }
      const updatedRule = data.rule || data

      // Update local state
      const index = rules.value.findIndex(r => r.rule_id === ruleId)
      if (index !== -1 && updatedRule) {
        rules.value[index] = updatedRule
      }

      return updatedRule
    } catch (e) {
      error.value = e.message || 'Failed to update rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a rule
   * DELETE /webhook/item/api/v1/rules/{rule_id}
   * @param {string} ruleId - The rule ID
   */
  async function deleteRule(ruleId) {
    loading.value = true
    error.value = null

    try {
      await apiFetch(`/webhook/item/api/v1/rules/${ruleId}`, {
        method: 'DELETE',
      })

      // Response format: { message: "Rule deleted" }
      // Remove from local state
      rules.value = rules.value.filter(r => r.rule_id !== ruleId)

      return true
    } catch (e) {
      error.value = e.message || 'Failed to delete rule'
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset the state
   */
  function reset() {
    loading.value = false
    error.value = null
    rules.value = []
    currentRule.value = null
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    loading,
    error,
    rules,
    currentRule,

    // Computed
    objectiveRules,
    goalRules,
    rulesByCategory,

    // Methods
    listRules,
    fetchAllRules,
    getRule,
    createRule,
    updateRule,
    deleteRule,
    reset,
    clearError,
  }
}
