import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { StockComponent } from './pages/stock/stock.component';
import { TransfersComponent } from './pages/transfers/transfers.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { StoreReportComponent } from './pages/store-report/store-report.component';
import { MystoreComponent } from './pages/mystore/mystore.component';

export const ADMIN_STORE_ROUTES: Routes = [
  {
    path: '',
    component: MystoreComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductsComponent },
      { path: 'stock', component: StockComponent },
      { path: 'transfers', component: TransfersComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'report', component: StoreReportComponent },
    ],
  },
];
