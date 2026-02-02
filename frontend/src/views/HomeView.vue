<template>
  <v-container class="main-container py-8">
    <!-- Hero Section -->
    <div class="hero-section text-center mb-8">
      <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">
        AI-Powered <span class="text-primary">Conformance Validation</span>
      </h1>
      <p class="text-body-1 text-medium-emphasis mx-auto mb-4" style="max-width: 600px;">
        Validate your goals and objectives against best practices using advanced AI analysis.
        Integrate via API into any system or workflow.
      </p>
      <v-chip size="small" variant="tonal" color="primary">
        <v-icon start size="small">mdi-api</v-icon>
        REST API Available
      </v-chip>
    </div>

    <!-- Main Checker Component -->
    <div class="checker-wrapper mx-auto">
      <ConformanceChecker />
    </div>

    <!-- POC Notice -->
    <v-alert
      variant="tonal"
      color="info"
      density="comfortable"
      class="mt-8 mx-auto poc-notice"
      max-width="650"
    >
      <template #prepend>
        <v-icon>mdi-flask-outline</v-icon>
      </template>
      <div class="d-flex align-center flex-wrap">
        <div class="flex-grow-1">
          <div class="text-subtitle-2 font-weight-medium mb-1">Proof of Concept</div>
          <div class="text-body-2">
            This is an early-stage demonstration. AI responses and suggestions will be significantly improved in future releases.
          </div>
        </div>
        <v-chip size="small" color="info" variant="flat" class="ml-2 mt-2 mt-sm-0">
          v0.1 Alpha
        </v-chip>
      </div>
    </v-alert>

    <!-- Validation Types Section -->
    <div class="validation-types-section mt-10">
      <div class="text-center mb-5">
        <h3 class="text-h6 font-weight-bold mb-2">Extensible Validation Engine</h3>
        <p class="text-body-2 text-medium-emphasis">
          One platform, unlimited conformance checks. Extend to any validation scenario.
        </p>
      </div>

      <v-row justify="center" class="ga-3">
        <!-- Active: Goals & Objectives -->
        <v-col cols="6" sm="4" md="3">
          <v-card
            variant="flat"
            class="pa-4 h-100 text-center validation-type-card active-card"
            color="primary"
          >
            <v-icon color="white" size="32" class="mb-2">mdi-target</v-icon>
            <div class="text-subtitle-2 font-weight-medium text-white">Goals & Objectives</div>
            <div class="text-caption text-white" style="opacity: 0.85">SMART criteria validation</div>
            <v-chip size="x-small" color="white" variant="flat" class="mt-2">
              <v-icon start size="x-small">mdi-check-circle</v-icon>
              Active
            </v-chip>
          </v-card>
        </v-col>

        <!-- Example: Activity -->
        <v-col cols="6" sm="4" md="3">
          <v-card
            variant="outlined"
            class="pa-4 h-100 text-center validation-type-card disabled-card"
            disabled
          >
            <v-chip size="x-small" color="grey" variant="tonal" class="future-badge">Example</v-chip>
            <v-icon color="grey" size="32" class="mb-2">mdi-run</v-icon>
            <div class="text-subtitle-2 font-weight-medium text-disabled">Activity</div>
            <div class="text-caption text-disabled">Action plan validation</div>
          </v-card>
        </v-col>

        <!-- Example: Indicator -->
        <v-col cols="6" sm="4" md="3">
          <v-card
            variant="outlined"
            class="pa-4 h-100 text-center validation-type-card disabled-card"
            disabled
          >
            <v-chip size="x-small" color="grey" variant="tonal" class="future-badge">Example</v-chip>
            <v-icon color="grey" size="32" class="mb-2">mdi-chart-line</v-icon>
            <div class="text-subtitle-2 font-weight-medium text-disabled">Indicator</div>
            <div class="text-caption text-disabled">KPI & metrics validation</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- More types hint -->
      <div class="text-center mt-4">
        <v-chip size="small" variant="text" color="secondary">
          <v-icon start size="small">mdi-plus-circle-outline</v-icon>
          Extend to any validation scenario...
        </v-chip>
      </div>
    </div>

    <!-- Integration Section -->
    <v-card variant="outlined" class="integration-card mt-10 mx-auto" max-width="650">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
            <v-icon>mdi-puzzle</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">Easy Integration</div>
            <div class="text-caption text-medium-emphasis">Add validation to any workflow</div>
          </div>
        </div>

        <v-row class="ga-4">
          <v-col cols="12" sm="6">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" size="20" class="mr-2">mdi-api</v-icon>
              <span class="text-body-2 font-weight-medium">REST API</span>
            </div>
            <div class="text-caption text-medium-emphasis">
              Simple HTTP endpoints for seamless integration with any system.
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" size="20" class="mr-2">mdi-code-json</v-icon>
              <span class="text-body-2 font-weight-medium">JSON Response</span>
            </div>
            <div class="text-caption text-medium-emphasis">
              Structured results with scores, issues, and actionable fixes.
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <div class="d-flex align-center justify-center flex-wrap ga-2">
          <v-chip size="small" variant="tonal" color="success">
            <v-icon start size="small">mdi-check</v-icon>
            LLM-Powered
          </v-chip>
          <v-chip size="small" variant="tonal" color="success">
            <v-icon start size="small">mdi-check</v-icon>
            Configurable Rulesets
          </v-chip>
          <v-chip size="small" variant="tonal" color="success">
            <v-icon start size="small">mdi-check</v-icon>
            Detailed Analysis
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import ConformanceChecker from '@/components/ConformanceChecker.vue'
</script>

<style scoped>
.main-container {
  max-width: 800px !important;
}

.checker-wrapper {
  max-width: 650px;
}

.hero-section h1 {
  line-height: 1.2;
}

.poc-notice {
  border-radius: 12px;
}

.validation-type-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.validation-type-card.active-card {
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.25);
}

.validation-type-card.active-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(var(--v-theme-primary), 0.35);
}

.validation-type-card.disabled-card {
  border-style: dashed !important;
  opacity: 0.7;
  cursor: not-allowed;
}

.future-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.integration-card {
  border-radius: 16px;
  border-color: rgba(var(--v-theme-primary), 0.2) !important;
}
</style>
