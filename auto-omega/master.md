Git/ Github
Phím tắt VS Code:
- Ctrl + ` (hoặc vào menu Terminal > New Terminal)

1. Đồng bộ code về máy (Clone)
git clone https://github.com/contact-omegaerp/omega.git
Lưu ý owner/project-name.git

2. Thiết lập danh tính (Chỉ làm lần đầu)
- Để GitHub biết ai là người đã sửa code, bạn cần cấu hình tên và email (trùng với email tạo tài khoản GitHub):
git config --global user.name "contact.omegaerp"
git config --global user.email "contact.omegaerp@gmail.com"

1. Quy trình làm việc và đẩy code lên (Push)
- Đánh dấu các file đã thay đổi:
git add .
git commit -m "Mô tả ngắn"
git push origin main (hoặc master)

- Cấu trúc lệnh
git push origin main
│ │ │
│ │ └─ Tên nhánh trên remote (GitHub)
│ └─ Tên remote (máy chủ từ xa)
└─ Lệnh đẩy code
Thống nhất dùng main vì chữ slave trong master/slave nghe nô lệ
Trước năm 2020: master
Sau tháng 10/2020: main

- Ngoài ra
git status
git remote -v trả về origin là URL gốc của repo (ví dụ https://github.com/contact-omegaerp/omega.git)