<template>
  <div class="loading-skeleton">
    <v-card variant="tonal" class="mb-6" rounded="lg">
      <v-card-item>
        <template #prepend>
          <v-skeleton-loader type="avatar" />
        </template>
        <v-skeleton-loader type="heading" />
      </v-card-item>
      <v-card-text>
        <v-row>
          <v-col v-for="i in 4" :key="i" cols="6" sm="3">
            <div class="text-center">
              <v-skeleton-loader type="avatar" class="mx-auto" />
              <v-skeleton-loader type="text" width="60%" class="mx-auto mt-2" />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card variant="outlined" rounded="lg">
      <v-card-text>
        <v-skeleton-loader type="list-item-avatar-three-line" />
        <v-skeleton-loader type="list-item-avatar-three-line" />
        <v-skeleton-loader type="list-item-avatar-three-line" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.loading-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
