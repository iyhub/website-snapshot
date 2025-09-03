<script lang="ts">
    import github from "$lib/assets/github.svg";
    import x from "$lib/assets/x-logo.svg";
</script>

<header
    class="flex justify-between items-center h-16 px-8 max-w-screen-lg mx-auto"
>
    <a href="/" class="flex items-center gap-2">
        <img src={"/icon-192.png"} alt="GitHub" class="w-6 h-6" />
        <h1 class="text-2xl font-bold">Web Pika</h1>
    </a>
    <nav class="flex items-center gap-4">
        <li>
            <a href="https://x.com/sh_awai" target="_blank">
                <img src={x} alt="X" class="w-8 h-8" />
            </a>
        </li>
        <li>
            <a href="https://github.com/iyhub/website-snapshot" target="_blank">
                <img src={github} alt="GitHub" class="w-8 h-8" />
            </a>
        </li>
    </nav>
</header>

<style>
    li {
        list-style: none;
    }
</style>
