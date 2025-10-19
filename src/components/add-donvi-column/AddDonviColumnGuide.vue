<template>
  <div class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10">
    <div class="w-full max-w-[830px] flex flex-col gap-4">
      <h3 class="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
        Hướng dẫn sử dụng tính năng thêm cột Donvi
      </h3>
      <ol class="list-decimal list-inside text-sm text-gray-500 dark:text-gray-400 sm:text-base flex flex-col gap-2">
         <li>Tải và giải nén folder kết quả.</li>
            <li>
              Tải và giải nén các file logic <code class="font-bold">convert_to_xls.bat</code> và
              <code class="font-bold">do_not_touch_convert_excel.ps1</code> bằng cách nhấn vào nút
              Download bên dưới và đặt chúng cùng với folder kết quả.
            </li>
            <li>Nhấp đúp chuột để chạy file <code class="font-bold">convert_to_xls.bat</code>.</li>
            <li>Kiểm tra kết quả trong folder "<code>dd-mm-yyyy-Converted</code>".</li>
      </ol>
    </div>
  </div>
</template>
