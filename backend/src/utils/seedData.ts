import bcrypt from 'bcryptjs';
import prisma from './database';

export const seedDemoData = async () => {
  try {
    console.log('🌱 Demo verileri oluşturuluyor...');

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@demo.com' },
    });

    if (existingUser) {
      console.log('✅ Demo kullanıcı zaten mevcut');
      return;
    }

    // Create demo company
    const demoCompany = await prisma.company.create({
      data: {
        name: 'Demo Şirketi A.Ş.',
        taxNumber: '1234567890',
        address: 'Demo Mahallesi, Demo Sokak No:1, İstanbul',
        phone: '+90 212 123 45 67',
        email: 'info@demo.com',
        website: 'https://demo.com',
        currency: 'TRY',
        taxRate: 18.0,
        invoiceNote: 'Bu bir demo faturadır.',
      },
    });

    // Hash demo password
    const hashedPassword = await bcrypt.hash('demo123', 12);

    // Create demo admin user
    const demoUser = await prisma.user.create({
      data: {
        email: 'admin@demo.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true,
        companyId: demoCompany.id,
      },
    });

    // Create demo customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'ABC Teknoloji Ltd.',
          email: 'info@abc.com',
          phone: '+90 212 111 22 33',
          address: 'Teknoloji Mahallesi, İnovasyon Caddesi No:10, İstanbul',
          taxNumber: '1111111111',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
      prisma.customer.create({
        data: {
          name: 'XYZ Danışmanlık A.Ş.',
          email: 'contact@xyz.com',
          phone: '+90 212 222 33 44',
          address: 'İş Merkezi, Danışmanlık Sokak No:5, İstanbul',
          taxNumber: '2222222222',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
      prisma.customer.create({
        data: {
          name: 'DEF Yazılım Çözümleri',
          email: 'hello@def.com',
          phone: '+90 212 333 44 55',
          address: 'Yazılım Vadisi, Kod Caddesi No:15, İstanbul',
          taxNumber: '3333333333',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
    ]);

    // Create demo suppliers
    const suppliers = await Promise.all([
      prisma.supplier.create({
        data: {
          name: 'Ofis Malzemeleri A.Ş.',
          email: 'satis@ofismalzeme.com',
          phone: '+90 212 444 55 66',
          address: 'Sanayi Sitesi, Malzeme Caddesi No:20, İstanbul',
          taxNumber: '4444444444',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
      prisma.supplier.create({
        data: {
          name: 'Teknoloji Tedarik Ltd.',
          email: 'info@tektedarik.com',
          phone: '+90 212 555 66 77',
          address: 'Teknoloji Merkezi, Tedarik Sokak No:8, İstanbul',
          taxNumber: '5555555555',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
    ]);

    // Create demo products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Web Tasarım Hizmeti',
          description: 'Profesyonel web sitesi tasarım ve geliştirme hizmeti',
          price: 5000.0,
          stock: 0,
          minStock: 0,
          unit: 'hizmet',
          category: 'Yazılım Hizmetleri',
          type: 'SERVICE',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Mobil Uygulama Geliştirme',
          description: 'iOS ve Android mobil uygulama geliştirme hizmeti',
          price: 15000.0,
          stock: 0,
          minStock: 0,
          unit: 'hizmet',
          category: 'Yazılım Hizmetleri',
          type: 'SERVICE',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Danışmanlık Hizmeti',
          description: 'IT danışmanlık ve sistem analizi hizmeti',
          price: 500.0,
          stock: 0,
          minStock: 0,
          unit: 'saat',
          category: 'Danışmanlık',
          type: 'SERVICE',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
      prisma.product.create({
        data: {
          name: 'Laptop',
          description: 'İş amaçlı laptop bilgisayar',
          price: 25000.0,
          stock: 5,
          minStock: 2,
          unit: 'adet',
          category: 'Bilgisayar',
          barcode: '1234567890123',
          type: 'PRODUCT',
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      }),
    ]);

    // Create demo transactions
    const transactions = await Promise.all([
      prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: 5000.0,
          description: 'Web tasarım projesi ödemesi',
          date: new Date('2024-05-20'),
          category: 'Hizmet Geliri',
          reference: 'WEB-001',
          companyId: demoCompany.id,
          userId: demoUser.id,
          customerId: customers[0].id,
        },
      }),
      prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: 15000.0,
          description: 'Mobil uygulama geliştirme projesi',
          date: new Date('2024-05-18'),
          category: 'Hizmet Geliri',
          reference: 'MOB-001',
          companyId: demoCompany.id,
          userId: demoUser.id,
          customerId: customers[1].id,
        },
      }),
      prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: 4000.0,
          description: 'Ofis kirası',
          date: new Date('2024-05-01'),
          category: 'Kira Giderleri',
          reference: 'KIRA-05-2024',
          companyId: demoCompany.id,
          userId: demoUser.id,
          supplierId: suppliers[0].id,
        },
      }),
      prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: 2500.0,
          description: 'Laptop satın alma',
          date: new Date('2024-05-15'),
          category: 'Ekipman Giderleri',
          reference: 'EKP-001',
          companyId: demoCompany.id,
          userId: demoUser.id,
          supplierId: suppliers[1].id,
        },
      }),
    ]);

    // Create demo invoices
    const invoice1 = await prisma.invoice.create({
      data: {
        invoiceNo: 'FAT-2024-001',
        date: new Date('2024-05-20'),
        dueDate: new Date('2024-06-20'),
        status: 'PAID',
        type: 'SALES',
        subtotal: 5000.0,
        taxAmount: 900.0,
        total: 5900.0,
        notes: 'Web tasarım projesi tamamlandı',
        paidAmount: 5900.0,
        companyId: demoCompany.id,
        userId: demoUser.id,
        customerId: customers[0].id,
      },
    });

    await prisma.invoiceItem.create({
      data: {
        quantity: 1,
        price: 5000.0,
        total: 5000.0,
        invoiceId: invoice1.id,
        productId: products[0].id,
      },
    });

    const invoice2 = await prisma.invoice.create({
      data: {
        invoiceNo: 'FAT-2024-002',
        date: new Date('2024-05-22'),
        dueDate: new Date('2024-06-22'),
        status: 'SENT',
        type: 'SALES',
        subtotal: 3000.0,
        taxAmount: 540.0,
        total: 3540.0,
        notes: 'Danışmanlık hizmeti',
        paidAmount: 0.0,
        companyId: demoCompany.id,
        userId: demoUser.id,
        customerId: customers[2].id,
      },
    });

    await prisma.invoiceItem.create({
      data: {
        quantity: 6,
        price: 500.0,
        total: 3000.0,
        invoiceId: invoice2.id,
        productId: products[2].id,
      },
    });

    // Create demo cashbook entries
    console.log('📝 Kasa defteri kayıtları oluşturuluyor...');
    
    let currentBalance = 0;
    
    const cashBookEntries = [
      {
        type: 'CASH_IN',
        amount: 50000,
        description: 'Açılış kasası',
        date: new Date('2024-01-01'),
        category: 'Diğer Gelir',
        reference: 'AÇ-001',
        notes: 'İşletme açılış kasası',
      },
      {
        type: 'CASH_IN',
        amount: 15000,
        description: 'Nakit satış tahsilatı',
        date: new Date('2024-01-02'),
        category: 'Satış Tahsilatı',
        reference: 'NS-001',
        notes: 'Günlük nakit satış',
      },
      {
        type: 'CASH_OUT',
        amount: 5000,
        description: 'Ofis kira ödemesi',
        date: new Date('2024-01-03'),
        category: 'Kira',
        reference: 'KR-001',
        notes: 'Ocak ayı kira',
      },
      {
        type: 'CASH_OUT',
        amount: 2500,
        description: 'Elektrik faturası',
        date: new Date('2024-01-04'),
        category: 'Gider Ödemesi',
        reference: 'EL-001',
        notes: 'Aralık ayı elektrik',
      },
      {
        type: 'CASH_IN',
        amount: 8000,
        description: 'Müşteri ödemesi',
        date: new Date('2024-01-05'),
        category: 'Müşteri Ödemesi',
        reference: 'MÖ-001',
        notes: 'ABC Ltd. fatura ödemesi',
      },
      {
        type: 'CASH_OUT',
        amount: 3000,
        description: 'Maaş ödemesi',
        date: new Date('2024-05-01'),
        category: 'Maaş Ödemesi',
        reference: 'MZ-001',
        notes: 'Mayıs ayı maaş',
      },
      {
        type: 'CASH_IN',
        amount: 12000,
        description: 'Proje teslim ödemesi',
        date: new Date('2024-05-20'),
        category: 'Satış Tahsilatı',
        reference: 'PT-001',
        notes: 'Web projesi teslim',
      },
    ];

    for (const entry of cashBookEntries) {
      currentBalance = entry.type === 'CASH_IN' 
        ? currentBalance + entry.amount 
        : currentBalance - entry.amount;
        
      await prisma.cashBook.create({
        data: {
          ...entry,
          balance: currentBalance,
          companyId: demoCompany.id,
          userId: demoUser.id,
        },
      });
    }

    console.log('✅ Demo verileri başarıyla oluşturuldu!');
    console.log('📧 Demo kullanıcı: admin@demo.com');
    console.log('🔑 Demo şifre: demo123');
    console.log('💵 Kasa bakiyesi: ₺' + currentBalance.toLocaleString());
    
  } catch (error) {
    console.error('❌ Demo verileri oluşturulurken hata:', error);
    throw error;
  }
}; 