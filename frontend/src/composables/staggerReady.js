import { onMounted, ref, nextTick } from 'vue'

export const useStaggerReady = () => {
    const staggerReady = ref(false)

    onMounted(async() => {
        await nextTick()
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => { staggerReady.value = true })
        } else {
            staggerReady.value = true
        }
    })

    return staggerReady
}
