import React, { useState } from 'react';
import { ShoppingCart, Phone, Store, User, LogOut, Trash2, Plus, Minus, Search, Printer, Settings, DollarSign, Users, Edit2, Save, X, Pizza } from 'lucide-react';

const PizzeriaSystem = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState({
    type: 'telefono',
    customerName: '',
    phone: '',
    address: '',
    items: [],
    total: 0
  });
  const [showSearch, setShowSearch] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Estados para administrador
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminView, setAdminView] = useState('menu'); // 'menu', 'users', 'cash'
  const [clickedItem, setClickedItem] = useState(null);
  
  // Estados para el modal de pago (estos faltaban)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountPaid, setAmountPaid] = useState('');
  
  const [menu, setMenu] = useState([
    { id: 1, name: 'Margarita', price: 120 },
    { id: 2, name: 'Pepperoni', price: 150 },
    { id: 3, name: 'Hawaiana', price: 145 },
    { id: 4, name: 'Mexicana', price: 160 },
    { id: 5, name: 'Vegetariana', price: 140 },
    { id: 6, name: 'Cuatro Quesos', price: 165 },
    { id: 7, name: 'Carnes Frías', price: 170 },
    { id: 8, name: 'Suprema', price: 180 }
  ]);
  const [users, setUsers] = useState([
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
    { username: 'cajero1', password: 'password123', role: 'cajero', name: 'Cajero 1' }
  ]);
  const [editingItem, setEditingItem] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'cajero' });
  const [selectedCashier, setSelectedCashier] = useState('todos'); // Para filtro de corte de caja
  
  // Estados para cierre de corte
  const [showCloseCutModal, setShowCloseCutModal] = useState(false);
  const [closeCutData, setCloseCutData] = useState({
    initialFund: '',
    finalCash: '',
    voucherTotal: '',
    cashier: 'todos'
  });
  const [closedCuts, setClosedCuts] = useState([]); // Historial de cortes cerrados
  const [showCutHistory, setShowCutHistory] = useState(false);
  
  // Estados para resumen de transacción
  const [showTransactionSummary, setShowTransactionSummary] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      setUsername('');
      setPassword('');
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentOrder({
      type: 'telefono',
      customerName: '',
      phone: '',
      address: '',
      items: [],
      total: 0
    });
    setShowSearch(false);
    setSearchPhone('');
    setSearchResults([]);
    setShowAdminPanel(false);
  };

  const addItemToOrder = (item) => {
    // Efecto visual de click
    setClickedItem(item.id);
    setTimeout(() => setClickedItem(null), 300);
    
    const existingItem = currentOrder.items.find(i => i.id === item.id);
    
    if (existingItem) {
      const updatedItems = currentOrder.items.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      updateOrderTotal(updatedItems);
    } else {
      const updatedItems = [...currentOrder.items, { ...item, quantity: 1 }];
      updateOrderTotal(updatedItems);
    }
  };

  const updateOrderTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCurrentOrder({ ...currentOrder, items, total });
  };

  const updateQuantity = (itemId, delta) => {
    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);
    
    updateOrderTotal(updatedItems);
  };

  const removeItem = (itemId) => {
    const updatedItems = currentOrder.items.filter(item => item.id !== itemId);
    updateOrderTotal(updatedItems);
  };

  const completeOrder = () => {
    if (currentOrder.items.length === 0) {
      alert('Agrega productos a la orden');
      return;
    }
    
    if (currentOrder.type === 'telefono') {
      if (!currentOrder.customerName || !currentOrder.customerName.trim()) {
        alert('Ingresa el nombre del cliente');
        return;
      }
      if (!currentOrder.phone || !currentOrder.phone.trim()) {
        alert('Ingresa el teléfono del cliente');
        return;
      }
      if (!currentOrder.address || !currentOrder.address.trim()) {
        alert('Ingresa la dirección de entrega');
        return;
      }
    }

    // Abrir modal de pago
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (paymentMethod === 'efectivo') {
      const paid = parseFloat(amountPaid);
      if (!amountPaid || isNaN(paid)) {
        alert('Ingresa la cantidad pagada');
        return;
      }
      if (paid < currentOrder.total) {
        alert('La cantidad pagada es menor al total');
        return;
      }
    }

    const newOrder = {
      ...currentOrder,
      id: Date.now(),
      timestamp: new Date().toLocaleString('es-MX'),
      cashier: currentUser.name,
      customerName: currentOrder.customerName.trim() || (currentOrder.type === 'mostrador' ? 'Cliente Mostrador' : 'Sin nombre'),
      phone: currentOrder.phone.trim() || '',
      address: currentOrder.type === 'telefono' ? currentOrder.address : 'En tienda',
      paymentMethod: paymentMethod,
      amountPaid: paymentMethod === 'efectivo' ? parseFloat(amountPaid) : currentOrder.total,
      change: paymentMethod === 'efectivo' ? parseFloat(amountPaid) - currentOrder.total : 0
    };

    setOrders([newOrder, ...orders]);
    printTicket(newOrder);
    
    // Guardar la orden completada para mostrar resumen
    setLastCompletedOrder(newOrder);
    
    // Limpiar completamente el formulario actual
    setCurrentOrder({
      type: 'telefono', // Resetear al tipo por defecto
      customerName: '',
      phone: '',
      address: '',
      items: [],
      total: 0
    });
    
    // Cerrar modal de pago y resetear sus estados
    setShowPaymentModal(false);
    setPaymentMethod('efectivo');
    setAmountPaid('');
    
    // Mostrar resumen de transacción
    setShowTransactionSummary(true);
  };

  const calculateChange = () => {
    if (paymentMethod === 'tarjeta') return 0;
    const paid = parseFloat(amountPaid);
    if (!amountPaid || isNaN(paid)) return 0;
    return Math.max(0, paid - currentOrder.total);
  };

  const printTicket = (order) => {
    const ticketWindow = window.open('', '_blank', 'width=300,height=600');
    
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket #${order.id}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
          }
          .info {
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .items {
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 40px;
            text-align: center;
          }
          .item-price {
            width: 60px;
            text-align: right;
          }
          .total-section {
            border-top: 2px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 11px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍕 PIZZERÍA</h1>
          <p>Ticket #${order.id}</p>
        </div>
        
        <div class="info">
          <div class="info-row">
            <strong>Fecha:</strong>
            <span>${order.timestamp}</span>
          </div>
          <div class="info-row">
            <strong>Cajero:</strong>
            <span>${order.cashier}</span>
          </div>
          <div class="info-row">
            <strong>Tipo:</strong>
            <span>${order.type === 'telefono' ? 'Teléfono' : 'Mostrador'}</span>
          </div>
          ${order.type === 'telefono' ? `
            <div class="info-row">
              <strong>Cliente:</strong>
              <span>${order.customerName}</span>
            </div>
            <div class="info-row">
              <strong>Teléfono:</strong>
              <span>${order.phone}</span>
            </div>
            <div class="info-row">
              <strong>Dirección:</strong>
              <span>${order.address}</span>
            </div>
          ` : order.customerName && order.customerName !== 'Cliente Mostrador' ? `
            <div class="info-row">
              <strong>Cliente:</strong>
              <span>${order.customerName}</span>
            </div>
          ` : ''}
          <div class="info-row">
            <strong>Forma de pago:</strong>
            <span>${order.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</span>
          </div>
        </div>
        
        <div class="items">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; padding-bottom: 5px;">
            <strong>PRODUCTOS</strong>
          </div>
          ${order.items.map(item => `
            <div class="item">
              <span class="item-name">${item.name}</span>
              <span class="item-qty">x${item.quantity}</span>
              <span class="item-price">$${item.price * item.quantity}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total-section">
          <div class="total">
            <span>TOTAL:</span>
            <span>$${order.total}</span>
          </div>
          ${order.paymentMethod === 'efectivo' ? `
            <div class="total">
              <span>PAGADO:</span>
              <span>$${order.amountPaid.toFixed(2)}</span>
            </div>
            <div class="total">
              <span>CAMBIO:</span>
              <span>$${order.change.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>¡Gracias por su preferencia!</p>
          <p>www.pizzeria.com</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    ticketWindow.document.write(ticketHTML);
    ticketWindow.document.close();
  };

  const clearCurrentOrder = () => {
    setCurrentOrder({
      type: 'telefono',
      customerName: '',
      phone: '',
      address: '',
      items: [],
      total: 0
    });
    // También limpiar estados relacionados
    setSearchPhone('');
    setSearchResults([]);
    setSelectedOrder(null);
    setShowSearch(false);
  };

  const searchOrders = () => {
    if (!searchPhone.trim()) {
      alert('Ingresa un número telefónico');
      return;
    }
    
    const results = orders.filter(order => 
      order.phone && order.phone.includes(searchPhone)
    );
    
    setSearchResults(results);
    
    if (results.length === 0) {
      alert('No se encontraron órdenes con ese número');
    }
  };

  const findCustomerByPhone = (phone) => {
    if (!phone || phone.length < 4) return null;
    
    const customerOrders = orders.filter(order => 
      order.phone && order.phone.includes(phone)
    );
    
    if (customerOrders.length > 0) {
      customerOrders.sort((a, b) => b.id - a.id);
      return customerOrders[0];
    }
    
    return null;
  };

  const handlePhoneChange = (phone) => {
    setCurrentOrder({ ...currentOrder, phone });
    
    if (phone.length >= 4) {
      const customer = findCustomerByPhone(phone);
      if (customer) {
        setCurrentOrder({
          ...currentOrder,
          phone: phone,
          customerName: customer.customerName,
          address: customer.address
        });
      }
    }
  };

  // Funciones de administrador
  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Completa todos los campos');
      return;
    }
    
    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: parseFloat(newProduct.price)
    };
    
    setMenu([...menu, product]);
    setNewProduct({ name: '', price: '' });
    alert('Producto agregado exitosamente');
  };

  const updateProduct = (id, name, price) => {
    setMenu(menu.map(item => 
      item.id === id ? { ...item, name, price: parseFloat(price) } : item
    ));
    setEditingItem(null);
    alert('Producto actualizado');
  };

  const deleteProduct = (id) => {
    if (confirm('¿Eliminar este producto del menú?')) {
      setMenu(menu.filter(item => item.id !== id));
    }
  };

  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('Completa todos los campos');
      return;
    }
    
    if (users.find(u => u.username === newUser.username)) {
      alert('Este nombre de usuario ya existe');
      return;
    }
    
    setUsers([...users, { ...newUser }]);
    setNewUser({ username: '', password: '', name: '', role: 'cajero' });
    alert('Usuario agregado exitosamente');
  };

  const deleteUser = (username) => {
    if (username === 'admin') {
      alert('No puedes eliminar al administrador principal');
      return;
    }
    
    if (confirm('¿Eliminar este usuario?')) {
      setUsers(users.filter(u => u.username !== username));
    }
  };

  const calculateCashReport = (cashierFilter = 'todos') => {
    let filteredOrders = orders;
    
    if (cashierFilter !== 'todos') {
      filteredOrders = orders.filter(order => order.cashier === cashierFilter);
    }
    
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const phoneOrders = filteredOrders.filter(o => o.type === 'telefono').length;
    const counterOrders = filteredOrders.filter(o => o.type === 'mostrador').length;
    const cashOrders = filteredOrders.filter(o => o.paymentMethod === 'efectivo');
    const cardOrders = filteredOrders.filter(o => o.paymentMethod === 'tarjeta');
    const totalCash = cashOrders.reduce((sum, order) => sum + order.total, 0);
    const totalCard = cardOrders.reduce((sum, order) => sum + order.total, 0);
    
    return { 
      totalSales, 
      totalOrders, 
      phoneOrders, 
      counterOrders, 
      cashOrders: cashOrders.length,
      cardOrders: cardOrders.length,
      totalCash,
      totalCard,
      filteredOrders 
    };
  };

  const printCashReport = (cashierFilter = 'todos') => {
    const report = calculateCashReport(cashierFilter);
    const reportWindow = window.open('', '_blank', 'width=400,height=700');
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Corte de Caja${cashierFilter !== 'todos' ? ' - ' + cashierFilter : ''}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
          }
          h1 {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .info {
            margin: 20px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px;
          }
          .row.highlight {
            background: #f0f0f0;
            font-weight: bold;
            font-size: 18px;
          }
          .section {
            margin: 20px 0;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 20px;
          }
          .signature {
            margin-top: 50px;
            border-top: 1px solid #000;
            width: 200px;
            margin-left: auto;
            margin-right: auto;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>CORTE DE CAJA</h1>
        
        <div class="info">
          <div class="row">
            <span>Fecha:</span>
            <span>${new Date().toLocaleString('es-MX')}</span>
          </div>
          <div class="row">
            <span>Cajero:</span>
            <span>${cashierFilter === 'todos' ? 'TODOS' : cashierFilter}</span>
          </div>
          <div class="row">
            <span>Generado por:</span>
            <span>${currentUser.name}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>RESUMEN DE VENTAS</h3>
          <div class="row">
            <span>Total de órdenes:</span>
            <span>${report.totalOrders}</span>
          </div>
          <div class="row">
            <span>Órdenes telefónicas:</span>
            <span>${report.phoneOrders}</span>
          </div>
          <div class="row">
            <span>Órdenes en mostrador:</span>
            <span>${report.counterOrders}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>FORMAS DE PAGO</h3>
          <div class="row">
            <span>Pagos en efectivo:</span>
            <span>${report.cashOrders}</span>
          </div>
          <div class="row">
            <span>Total efectivo:</span>
            <span>$${report.totalCash.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Pagos con tarjeta:</span>
            <span>${report.cardOrders}</span>
          </div>
          <div class="row">
            <span>Total tarjeta:</span>
            <span>$${report.totalCard.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="info">
          <div class="row highlight">
            <span>TOTAL EN CAJA:</span>
            <span>$${report.totalSales.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Sistema de Pizzería</p>
          <div class="signature">
            Firma del ${cashierFilter === 'todos' ? 'Supervisor' : 'Cajero'}
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  const deleteOrder = (orderId) => {
    if (confirm('¿Estás seguro de eliminar esta orden? Esta acción no se puede deshacer.')) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      alert('Orden eliminada exitosamente');
    }
  };

  const openCloseCutModal = () => {
    setCloseCutData({
      ...closeCutData,
      cashier: selectedCashier
    });
    setShowCloseCutModal(true);
  };

  const closeCashCut = () => {
    const initialFund = parseFloat(closeCutData.initialFund);
    const finalCash = parseFloat(closeCutData.finalCash);
    const voucherTotal = parseFloat(closeCutData.voucherTotal);
    
    if (isNaN(initialFund) || isNaN(finalCash) || isNaN(voucherTotal)) {
      alert('Por favor ingresa valores válidos para todos los campos');
      return;
    }
    
    const report = calculateCashReport(closeCutData.cashier);
    const expectedCash = initialFund + report.totalCash;
    const difference = finalCash - expectedCash;
    
    const cutData = {
      id: Date.now(),
      cashier: closeCutData.cashier,
      date: new Date().toLocaleString('es-MX'),
      closedBy: currentUser.name,
      initialFund: initialFund,
      finalCash: finalCash,
      voucherTotal: voucherTotal,
      expectedCash: expectedCash,
      difference: difference,
      report: report,
      orders: report.filteredOrders
    };
    
    // Agregar al historial de cortes cerrados
    setClosedCuts([cutData, ...closedCuts]);
    
    // Remover las órdenes del cajero de la lista activa
    if (closeCutData.cashier === 'todos') {
      setOrders([]);
    } else {
      const remainingOrders = orders.filter(order => order.cashier !== closeCutData.cashier);
      setOrders(remainingOrders);
    }
    
    // Imprimir el corte final
    printFinalCashCut(cutData);
    
    setShowCloseCutModal(false);
    setCloseCutData({
      initialFund: '',
      finalCash: '',
      voucherTotal: '',
      cashier: 'todos'
    });
    
    alert('Corte de caja cerrado exitosamente');
  };

  const printFinalCashCut = (cutData) => {
    const reportWindow = window.open('', '_blank', 'width=400,height=800');
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Corte de Caja Cerrado - ${cutData.cashier}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
          }
          h1 {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .info {
            margin: 20px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px;
          }
          .row.highlight {
            background: #f0f0f0;
            font-weight: bold;
            font-size: 16px;
          }
          .row.total {
            background: ${cutData.difference >= 0 ? '#d4edda' : '#f8d7da'};
            font-weight: bold;
            font-size: 18px;
            border: 2px solid ${cutData.difference >= 0 ? '#28a745' : '#dc3545'};
          }
          .section {
            margin: 20px 0;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 20px;
          }
          .signature {
            margin-top: 50px;
            border-top: 1px solid #000;
            width: 200px;
            margin-left: auto;
            margin-right: auto;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>CORTE DE CAJA CERRADO</h1>
        
        <div class="info">
          <div class="row">
            <span>Fecha de cierre:</span>
            <span>${cutData.date}</span>
          </div>
          <div class="row">
            <span>Cajero:</span>
            <span>${cutData.cashier === 'todos' ? 'TODOS' : cutData.cashier}</span>
          </div>
          <div class="row">
            <span>Cerrado por:</span>
            <span>${cutData.closedBy}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>RESUMEN DE VENTAS</h3>
          <div class="row">
            <span>Total de órdenes:</span>
            <span>${cutData.report.totalOrders}</span>
          </div>
          <div class="row">
            <span>Ventas en efectivo:</span>
            <span>$${cutData.report.totalCash.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Ventas con tarjeta:</span>
            <span>$${cutData.report.totalCard.toFixed(2)}</span>
          </div>
          <div class="row highlight">
            <span>Total de ventas:</span>
            <span>$${cutData.report.totalSales.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>ARQUEO DE CAJA</h3>
          <div class="row">
            <span>Fondo inicial:</span>
            <span>$${cutData.initialFund.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Efectivo esperado:</span>
            <span>$${cutData.expectedCash.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Efectivo contado:</span>
            <span>$${cutData.finalCash.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Total vouchers:</span>
            <span>$${cutData.voucherTotal.toFixed(2)}</span>
          </div>
          <div class="row total">
            <span>${cutData.difference >= 0 ? 'SOBRANTE:' : 'FALTANTE:'}</span>
            <span>$${Math.abs(cutData.difference).toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Sistema de Pizzería</p>
          <div class="signature">
            Firma del Cajero
          </div>
          <div class="signature">
            Firma del Supervisor
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  const clearOrders = () => {
    if (confirm('¿Estás seguro de limpiar todas las órdenes? Esta acción no se puede deshacer.')) {
      setOrders([]);
      alert('Órdenes limpiadas exitosamente');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-green-500 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black">Pizzería System</h1>
            <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa tu usuario"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Iniciar Sesión
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-xs text-gray-600 text-center">
              <strong>Cajero:</strong> cajero1 / password123
            </p>
            <p className="text-xs text-gray-600 text-center">
              <strong>Admin:</strong> admin / admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sistema Pizzería</h1>
            <p className="text-sm text-gray-300">{currentUser.role === 'admin' ? 'Administrador' : 'Cajero'}: {currentUser.name}</p>
          </div>
          <div className="flex gap-3">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            )}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              <Search className="w-4 h-4" />
              Consultar
            </button>
            <button
              onClick={clearCurrentOrder}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Nueva Venta
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cierre de Corte */}
      {showCloseCutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-300">
            <div className="bg-black text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Cerrar Corte de Caja</h2>
              <button
                onClick={() => setShowCloseCutModal(false)}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Arqueo de Caja</h3>
                <p className="text-sm text-yellow-700">
                  Cajero: <strong>{closeCutData.cashier === 'todos' ? 'TODOS' : closeCutData.cashier}</strong><br/>
                  Este proceso cerrará el corte y removerá las órdenes de la vista activa.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Fondo de Caja Inicial ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={closeCutData.initialFund}
                    onChange={(e) => setCloseCutData({...closeCutData, initialFund: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Efectivo Final Contado ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={closeCutData.finalCash}
                    onChange={(e) => setCloseCutData({...closeCutData, finalCash: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Total de Vouchers de Tarjeta ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={closeCutData.voucherTotal}
                    onChange={(e) => setCloseCutData({...closeCutData, voucherTotal: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* Vista previa de cálculos */}
                {closeCutData.initialFund && closeCutData.finalCash && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">Vista Previa:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Fondo inicial:</span>
                        <span>${parseFloat(closeCutData.initialFund || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ventas en efectivo:</span>
                        <span>${calculateCashReport(closeCutData.cashier).totalCash.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Efectivo esperado:</span>
                        <span>${(parseFloat(closeCutData.initialFund || 0) + calculateCashReport(closeCutData.cashier).totalCash).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efectivo contado:</span>
                        <span>${parseFloat(closeCutData.finalCash || 0).toFixed(2)}</span>
                      </div>
                      {closeCutData.finalCash && (
                        <div className={`flex justify-between font-bold text-lg ${
                          (parseFloat(closeCutData.finalCash) - (parseFloat(closeCutData.initialFund || 0) + calculateCashReport(closeCutData.cashier).totalCash)) >= 0 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>
                            {(parseFloat(closeCutData.finalCash) - (parseFloat(closeCutData.initialFund || 0) + calculateCashReport(closeCutData.cashier).totalCash)) >= 0 
                              ? 'Sobrante:' : 'Faltante:'}
                          </span>
                          <span>
                            ${Math.abs(parseFloat(closeCutData.finalCash) - (parseFloat(closeCutData.initialFund || 0) + calculateCashReport(closeCutData.cashier).totalCash)).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCloseCutModal(false)}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={closeCashCut}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Cerrar Corte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Cortes */}
      {showCutHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[80vh] overflow-hidden border border-gray-300">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Historial de Cortes Cerrados</h2>
              <button
                onClick={() => setShowCutHistory(false)}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {closedCuts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay cortes cerrados en el historial.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {closedCuts.map(cut => (
                    <div key={cut.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Cajero:</span>
                          <p className="text-gray-900">{cut.cashier === 'todos' ? 'TODOS' : cut.cashier}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Fecha:</span>
                          <p className="text-gray-900">{cut.date}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Total Ventas:</span>
                          <p className="text-green-600 font-bold">${cut.report.totalSales.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            {cut.difference >= 0 ? 'Sobrante:' : 'Faltante:'}
                          </span>
                          <p className={`font-bold ${cut.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(cut.difference).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => printFinalCashCut(cut)}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-sm flex items-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          Reimprimir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resumen de Transacción */}
      {showTransactionSummary && lastCompletedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-300">
            <div className="bg-green-600 text-white p-4 rounded-t-lg text-center">
              <h2 className="text-xl font-bold">✅ Transacción Exitosa</h2>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-lg font-semibold text-gray-800">Orden #{lastCompletedOrder.id}</div>
                <div className="text-sm text-gray-600">{lastCompletedOrder.timestamp}</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">Cliente:</span>
                  <span className="font-semibold">{lastCompletedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tipo:</span>
                  <span className="font-semibold">{lastCompletedOrder.type === 'telefono' ? 'Teléfono' : 'Mostrador'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Forma de pago:</span>
                  <span className="font-semibold">{lastCompletedOrder.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-3">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-green-600">${lastCompletedOrder.total}</span>
                </div>
                {lastCompletedOrder.paymentMethod === 'efectivo' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Pagado:</span>
                      <span className="font-semibold">${lastCompletedOrder.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cambio:</span>
                      <span className="font-semibold text-blue-600">${lastCompletedOrder.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Productos:</div>
                {lastCompletedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowTransactionSummary(false);
                  setLastCompletedOrder(null);
                  // Limpiar completamente el formulario para nueva orden
                  setCurrentOrder({
                    type: 'telefono',
                    customerName: '',
                    phone: '',
                    address: '',
                    items: [],
                    total: 0
                  });
                  // Resetear cualquier búsqueda o estado temporal
                  setSearchPhone('');
                  setSearchResults([]);
                  setSelectedOrder(null);
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Aceptar - Nueva Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-300">
            <div className="bg-black text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Procesar Pago</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-lg text-black">Total a pagar:</span>
                  <div className="text-3xl font-bold text-green-600">${currentOrder.total}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Forma de pago</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`flex-1 p-3 rounded-lg border-2 transition ${
                        paymentMethod === 'efectivo'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      💵 Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`flex-1 p-3 rounded-lg border-2 transition ${
                        paymentMethod === 'tarjeta'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      💳 Tarjeta
                    </button>
                  </div>
                </div>

                {paymentMethod === 'efectivo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Cantidad recibida</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                    {amountPaid && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span>${currentOrder.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Recibido:</span>
                          <span>${amountPaid}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Cambio:</span>
                          <span className="text-green-600">${calculateChange().toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={processPayment}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Procesar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Administrador */}
      {showAdminPanel && currentUser.role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden border border-gray-300">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Panel de Administración</h2>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="flex border-b">
              <button
                onClick={() => setAdminView('menu')}
                className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 ${
                  adminView === 'menu' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'hover:bg-gray-50'
                }`}
              >
                <Pizza className="w-5 h-5" />
                Menú
              </button>
              <button
                onClick={() => setAdminView('users')}
                className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 ${
                  adminView === 'users' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Usuarios
              </button>
              <button
                onClick={() => setAdminView('cash')}
                className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 ${
                  adminView === 'cash' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Corte de Caja
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)]">
              {/* Vista de Menú */}
              {adminView === 'menu' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Gestión de Menú</h3>
                  
                  {/* Agregar nuevo producto */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-3">Agregar Nuevo Producto</h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Nombre del producto"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="Precio"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={addProduct}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="space-y-2">
                    {menu.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        {editingItem === item.id ? (
                          <>
                            <input
                              type="text"
                              defaultValue={item.name}
                              id={`name-${item.id}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="number"
                              defaultValue={item.price}
                              id={`price-${item.id}`}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => {
                                const name = document.getElementById(`name-${item.id}`).value;
                                const price = document.getElementById(`price-${item.id}`).value;
                                updateProduct(item.id, name, price);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-red-600">${item.price}</div>
                            </div>
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteProduct(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista de Usuarios */}
              {adminView === 'users' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Gestión de Usuarios</h3>
                  
                  {/* Agregar nuevo usuario */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-3">Agregar Nuevo Usuario</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Nombre completo"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Nombre de usuario"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Contraseña"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="cajero">Cajero</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button
                      onClick={addUser}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Usuario
                    </button>
                  </div>

                  {/* Lista de usuarios */}
                  <div className="space-y-2">
                    {users.map(user => (
                      <div key={user.username} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-600">Usuario: {user.username}</div>
                          <div className="text-xs text-gray-500">Rol: {user.role === 'admin' ? 'Administrador' : 'Cajero'}</div>
                        </div>
                        {user.username !== 'admin' && (
                          <button
                            onClick={() => deleteUser(user.username)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista de Corte de Caja */}
              {adminView === 'cash' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Corte de Caja</h3>
                  
                  {/* Selector de cajero */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <h4 className="font-semibold mb-3">Filtrar por Cajero</h4>
                    <select
                      value={selectedCashier}
                      onChange={(e) => setSelectedCashier(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="todos">Todos los cajeros</option>
                      {users.filter(user => user.role === 'cajero' || user.role === 'admin').map(user => (
                        <option key={user.username} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {selectedCashier === 'todos' ? 'Reporte General' : `Reporte de ${selectedCashier}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date().toLocaleString('es-MX')}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Total de órdenes:</span>
                          <span className="font-bold text-xl">{calculateCashReport(selectedCashier).totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Órdenes telefónicas:</span>
                          <span className="font-semibold">{calculateCashReport(selectedCashier).phoneOrders}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Órdenes mostrador:</span>
                          <span className="font-semibold">{calculateCashReport(selectedCashier).counterOrders}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Pagos en efectivo:</span>
                          <span className="font-semibold">{calculateCashReport(selectedCashier).cashOrders}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Pagos con tarjeta:</span>
                          <span className="font-semibold">{calculateCashReport(selectedCashier).cardOrders}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-700">Total efectivo:</span>
                          <span className="font-semibold text-green-600">${calculateCashReport(selectedCashier).totalCash.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg mt-4 border border-green-200">
                        <span className="text-lg font-bold">TOTAL EN CAJA:</span>
                        <span className="text-2xl font-bold text-green-600">${calculateCashReport(selectedCashier).totalSales.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => printCashReport(selectedCashier)}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Printer className="w-5 h-5" />
                      Vista Previa
                    </button>
                    <button
                      onClick={openCloseCutModal}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-5 h-5" />
                      Cerrar Corte
                    </button>
                    <button
                      onClick={() => setShowCutHistory(true)}
                      className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      Historial
                    </button>
                  </div>

                  {calculateCashReport(selectedCashier).filteredOrders.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">
                        Órdenes {selectedCashier === 'todos' ? 'Registradas' : `de ${selectedCashier}`}
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4">
                        {calculateCashReport(selectedCashier).filteredOrders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  Orden #{order.id}
                                </span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  {order.type === 'telefono' ? '📞 Teléfono' : '🏪 Mostrador'}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {order.paymentMethod === 'efectivo' ? '💵' : '💳'} {order.paymentMethod}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                                <span>Cliente: {order.customerName}</span>
                                <span>Cajero: {order.cashier}</span>
                                <span>Fecha: {order.timestamp}</span>
                                <span>Items: {order.items.length}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-bold text-green-600">${order.total}</div>
                                {order.paymentMethod === 'efectivo' && order.change > 0 && (
                                  <div className="text-xs text-gray-500">Cambio: ${order.change.toFixed(2)}</div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => printTicket(order)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded text-xs"
                                  title="Reimprimir ticket"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteOrder(order.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded text-xs"
                                  title="Eliminar orden"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {calculateCashReport(selectedCashier).filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay órdenes registradas {selectedCashier !== 'todos' ? `para ${selectedCashier}` : ''}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa de Orden */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-300">
            <div className="bg-black text-white p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Vista Previa - Orden #{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {/* Información de la orden */}
              <div className="mb-4 pb-4 border-b">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Fecha:</span>
                    <p className="text-gray-600">{selectedOrder.timestamp}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Cajero:</span>
                    <p className="text-gray-600">{selectedOrder.cashier}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Tipo:</span>
                    <p className="text-gray-600">{selectedOrder.type === 'telefono' ? 'Teléfono' : 'Mostrador'}</p>
                  </div>
                  {selectedOrder.type === 'telefono' && (
                    <>
                      <div>
                        <span className="font-semibold text-gray-700">Cliente:</span>
                        <p className="text-gray-600">{selectedOrder.customerName}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Teléfono:</span>
                        <p className="text-gray-600">{selectedOrder.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-gray-700">Dirección:</span>
                        <p className="text-gray-600">{selectedOrder.address}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Productos:</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-gray-700">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg mb-4 border border-green-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-green-600">${selectedOrder.total}</span>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => printTicket(selectedOrder)}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Reimprimir Ticket
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Búsqueda */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-gray-300">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Consultar Órdenes por Teléfono</h2>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchPhone('');
                  setSearchResults([]);
                }}
                className="text-white hover:bg-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-3 mb-6">
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchOrders()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ingresa el número telefónico"
                />
                <button
                  onClick={searchOrders}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map(order => (
                      <div key={order.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">Orden #{order.id}</h3>
                            <p className="text-sm text-gray-600">{order.timestamp}</p>
                          </div>
                          <button
                            onClick={() => printTicket(order)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition text-sm"
                          >
                            <Printer className="w-4 h-4" />
                            Reimprimir
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <span className="font-semibold">Cliente:</span> {order.customerName}
                          </div>
                          <div>
                            <span className="font-semibold">Teléfono:</span> {order.phone}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">Dirección:</span> {order.address}
                          </div>
                          <div>
                            <span className="font-semibold">Cajero:</span> {order.cashier}
                          </div>
                          <div>
                            <span className="font-semibold">Tipo:</span> {order.type === 'telefono' ? 'Teléfono' : 'Mostrador'}
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <p className="font-semibold mb-2">Productos:</p>
                          <div className="space-y-1 text-sm">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span className="font-semibold">${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-green-600">${order.total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchPhone && (
                  <p className="text-center text-gray-500 py-8">
                    No se encontraron órdenes. Intenta con otro número.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sección de Nueva Orden */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tipo de Orden */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Nueva Orden</h2>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setCurrentOrder({ ...currentOrder, type: 'telefono', customerName: '', phone: '', address: '' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition ${
                    currentOrder.type === 'telefono'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  Teléfono
                </button>
                
                <button
                  onClick={() => setCurrentOrder({ ...currentOrder, type: 'mostrador', customerName: '', phone: '', address: '' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition ${
                    currentOrder.type === 'mostrador'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  Mostrador
                </button>
              </div>

              {/* Campos de cliente - Mostrar para ambos tipos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Cliente {currentOrder.type === 'telefono' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={currentOrder.customerName}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={currentOrder.type === 'telefono' ? 'Nombre completo (requerido)' : 'Nombre completo (opcional)'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono {currentOrder.type === 'telefono' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    value={currentOrder.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={currentOrder.type === 'telefono' ? 'Número telefónico (requerido)' : 'Número telefónico (opcional)'}
                  />
                  {currentOrder.phone.length >= 4 && findCustomerByPhone(currentOrder.phone) && (
                    <p className="text-xs text-green-600 mt-1">✓ Cliente encontrado - Datos autocompletados</p>
                  )}
                </div>
                {currentOrder.type === 'telefono' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección de Entrega <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentOrder.address}
                      onChange={(e) => setCurrentOrder({ ...currentOrder, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Calle, número, colonia (requerido)"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Menú */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Menú</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {menu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItemToOrder(item)}
                    className={`p-4 border-2 rounded-lg text-left transition-all transform ${
                      clickedItem === item.id
                        ? 'border-green-500 bg-green-100 scale-95 shadow-inner'
                        : 'border-gray-200 hover:border-green-500 hover:bg-green-50 hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-green-600 font-bold">${item.price}</div>
                    {clickedItem === item.id && (
                      <div className="text-xs text-green-600 font-semibold mt-1">✓ Agregado</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Carrito y Resumen */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Orden Actual</h2>
              </div>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {currentOrder.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay productos</p>
                ) : (
                  currentOrder.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">${item.price} × {item.quantity}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${currentOrder.total}</span>
                </div>
                
                <button
                  onClick={completeOrder}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Completar Orden
                </button>
              </div>
            </div>

            {/* Historial Reciente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-3">Órdenes Recientes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orders.slice(0, 5).map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition text-left"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">
                        {order.type === 'telefono' ? '📞 ' + order.customerName : '🏪 Mostrador'}
                      </span>
                      <span className="font-bold text-green-600">${order.total}</span>
                    </div>
                    <div className="text-xs text-gray-500">{order.timestamp}</div>
                  </button>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Sin órdenes aún</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzeriaSystem;