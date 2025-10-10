// --- ESM imports ---
// // Browser-safe ESM imports via CDN
// import moment from "https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js";
// import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";
// import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
// import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";


// --- Variables ---
let cart = [];
let index = 0;
let autoPrint = false;
let allUsers = [];
let allProducts = [];
let allCategories = [];
let allTransactions = [];
let sold = [];
let state = [];
let sold_items = [];
let item;
let auth;
let holdOrder = 0;
let vat = 0;
let gst = 0;
let serviceCharges = 0;
let discount = 0;
let discountAmount = 0;
let customers = {};
let account_type = '';
let account_no = '';
// let perms = null;
let deleteId = 0;
let paymentType = 0;
let receipt = '';
let totalVat = 0;
let subTotal = 0;
let total = 0;
let method = '';
// let order_index = 0;
let user_index = 0;
// let product_index = 0;
// let transaction_index;
let host = 'localhost';
let port = '8001';
let dotInterval = setInterval(() => {
  $(".dot").text(".");
}, 3000);

// --- App-specific ---
let storage = {
  get: (key) => window.api.storeGet(key),
  set: (key, value) => window.api.storeSet(key, value),
  delete: (key) => window.api.storeDelete(key),
};

let api = `http://${host}:${port}/api/`;

let categories = [];
let holdOrderList = [];
let customerOrderList = [];
let ownUserEdit = null;
let totalPrice = 0;
let orderTotal = 0;
let auth_error = "Incorrect username or password";
let auth_empty = "Please enter a username and password";
let holdOrderlocation = $("#randerHoldOrders");
let customerOrderLocation = $("#randerCustomerOrders");
let settings;
let delAddr = '';
let platform;
let user = {};
let start = moment().startOf("month");
let end = moment();
let start_date = moment(start).toDate();
let end_date = moment(end).toDate();
let by_till = 0;
let by_user = 0;
let by_status = 1;


$(function () {

    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + '  -  ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        autoApply: true,
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 10,
        timePickerSeconds: true,
        // minDate: '',
        ranges: {
            'Today': [moment().startOf('day'), moment()],
            'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
            'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
            'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'This Month': [moment().startOf('month'), moment()],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);

});


$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// --- Load auth and user from storage ---
auth =  await storage.get('auth');
user = await storage.get('user');



// Load settings from API
function loadSettings() {
    $.get(api + 'settings/get', function(data) {
        if ($.isEmptyObject(data)) {
            settings = undefined;
        } else {
            settings = data;
            updateSettingsUI();
        }
        checkSettingsModal();
    }).fail(function(err) {
        console.error("Failed to load settings:", err);
    });
}

// Update UI with settings
function updateSettingsUI() {
    if (!settings) return;

    if (settings.symbol) {
        $("#price_curr, #payment_curr, #change_curr").text(settings.symbol);
    }

    // const vat = parseFloat(settings.percentage);
    // $("#taxInfo").text(settings.charge_tax ? vat : 0);
}

// Show modal if settings missing
function checkSettingsModal() {
    if (!settings && typeof auth !== "undefined") {
        $("#settingsModal").modal("show");
    }
}

// --- Main logic ---
if (!auth) {
    $("#loading").show();
    $.get(api + 'users/check/'); // initial check
    authenticate();
} else {
    // Auth exists
    $('#loading').show();
    setTimeout(() => $('#loading').hide(), 2000);

    platform = storage.get('settings');
    if (platform && platform.app === 'Network Point of Sale Terminal') {
        api = 'http://' + platform.ip + ':' + port + '/api/';
        perms = true;
    }

    // Load user details
    $.get(api + 'users/user/' + user.id, function(data) {
        user = data;
        $('#loggedin-user').text(user.fullname);
    });

    // Load settings AFTER function is defined
    loadSettings();

    // Load all users
    $.get(api + 'users/all', function(users) {
        allUsers = [...users];
    });

    // Initialize the rest of the UI once document is ready
    $(document).ready(function() {
        $(".loading").hide();

        loadCategories();
        loadProducts();
        loadCustomers();
        loadOrderType();
    

    // --- Handle settings form submission ---
    $("#settingsForm").on("submit", function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: "/api/settings/post",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                loadSettings(); // reload settings
                $("#settingsModal").modal("hide");
            },
            error: function(err) {
                console.error("Settings save failed:", err);
            }
        });
    });

    // --- Modal hide event ---
    $("#settingsModal").on("hide.bs.modal", function() {
        setTimeout(checkSettingsModal, 500);
    });




        if (0 == user.perm_products) { $(".p_one").hide() };
        if (0 == user.perm_categories) { $(".p_two").hide() };
        if (0 == user.perm_transactions) { $(".p_three").hide() };
        if (0 == user.perm_users) { $(".p_four").hide() };
        if (0 == user.perm_settings) { $(".p_five").hide() };

        async function loadProducts() {
            try {
                const data = await $.get(api + 'inventory/products');

                data.forEach(item => {
                    item.price = parseFloat(item.price).toFixed(2);
                });

                allProducts = [...data];

                loadProductList();

                $('#parent').text('');
                $('#categories').html(`<button type="button" id="all" class="btn btn-categories btn-white waves-effect waves-light">All</button>`);

                for (const item of data) {
                    if (!categories.includes(item.category)) {
                        categories.push(item.category);
                    }

                    let imgUrl = "./assets/images/default.jpg"; // fallback
                    if (item.img) {
                        imgUrl = `${api}images/${item.img}`; // served by express
                    }


                    const item_info = `
                        <div class="col-lg-2 box" 
                            data-category="${item.category}" 
                            onclick="$(this).addToCart(${item.id}, ${item.quantity}, ${item.stock})">
                            <div class="widget-panel widget-style-2">                    
                                <div id="image">
                                    <img src="${imgUrl}" id="product_img" alt="">
                                </div>                    
                                <div class="text-muted m-t-5 text-center">
                                    <div class="name" id="product_name">${item.name}</div> 
                                    <span class="sku">${item.sku || ''}</span>
                                    <span class="stock">STOCK </span>
                                    <span class="count">${item.stock == 1 ? (item.quantity > 0 ? item.quantity : 'N/A') : 'N/A'}</span>
                                </div>
                                <sp class="text-success text-center">
                                    <b data-plugin="counterup">${settings.symbol + item.price}</b>
                                </sp>
                            </div>
                        </div>`;

                    $('#parent').append(item_info);
                }

                // Populate category filter dropdown
                $('#categoryFilter').html('<option value="all">All Categories</option>');
                categories.forEach(category => {
                    const c = allCategories.filter(ctg => ctg.id == category);
                    const categoryName = c.length > 0 ? c[0].name : category;
                    $('#categoryFilter').append(`<option value="${category}">${categoryName}</option>`);
                });

                // Add category filter event handler
                $('#categoryFilter').on('change', function() {
                    const selectedCategory = $(this).val();
                    if (selectedCategory === 'all') {
                        $('.box').show();
                    } else {
                        $('.box').hide();
                        $(`.box`).filter(function() {
                            return $(this).data('category') === selectedCategory;
                        }).show();
                    }
                });


                // Add search functionality
                $('#search').on('input', function() {
                    const searchTerm = $(this).val().toLowerCase();
                    $('.box').each(function() {
                        const productName = $(this).find('.name').text().toLowerCase();
                        const sku = $(this).find('.sku').text().toLowerCase();
                        if (productName.includes(searchTerm) || sku.includes(searchTerm)) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                });

            } catch (err) {
                console.error("Error loading products:", err);
            }
        }

        function loadCategories() {
            $.get(api + 'categories/all', function (data) {
                allCategories = data;
                loadCategoryList();
                $('#category').html(`<option value="0">Select</option>`);
                allCategories.forEach(category => {
                    $('#category').append(`<option value="${category.id}">${category.name}</option>`);
                });
            }).fail(function(err) {
                console.error("Failed to load categories:", err);
                allCategories = [];
            });
        }


        function loadCustomers() {

            $.get(api + 'customers/all', function (data) {
                customers = {...data};

                $('#customer').html(`<option value="Walk in customer" selected="selected">Walk in customer</option>`);

                data.forEach(cust => {
                    let customerOpt = `<option value='${JSON.stringify({
                        id: cust.id,
                        name: cust.name,
                        phone: cust.phone,
                        email: cust.email,
                        address: cust.address
                    })}'>${cust.name}  (${cust?.phone})</option>`;

                    $('#customer').append(customerOpt);
                });

                 $('#customer').chosen();

            });

        }

        function loadOrderType() {
            let order_types = ['Dine-In', 'Take-Away', 'Delivery'];

            $('#order_type').html(''); // clear previous options

            order_types.forEach(ord => {
                let selected = ord === 'Dine-In' ? ' selected' : '';
                let order_t = `<option value="${ord}"${selected}>${ord}</option>`;
                $('#order_type').append(order_t);
            });
        }


        $.fn.addToCart = function (id, count, stock) {

            if (stock == 1) {
                if (count > 0) {
                    $.get(api + 'inventory/product/' + id, function (data) {
                        if (data && data.id) {
                            $(this).addProductToCart(data);
                        } else {
                            Swal.fire('Error', 'Product not found', 'error');
                        }
                    }).fail(function() {
                        Swal.fire('Error', 'Failed to load product', 'error');
                    });
                }
                else {
                    Swal.fire(
                        'Out of stock!',
                        'This item is currently unavailable',
                        'info'
                    );
                }
            }
            else {
                $.get(api + 'inventory/product/' + id, function (data) {
                    if (data && data.id) {
                        $(this).addProductToCart(data);
                    } else {
                        Swal.fire('Error', 'Product not found', 'error');
                    }
                }).fail(function() {
                    Swal.fire('Error', 'Failed to load product', 'error');
                });
            }

        };


        function barcodeSearch(e) {

            e.preventDefault();
            $("#basic-addon2").empty();
            $("#basic-addon2").append(
                $('<i>', { class: 'fa fa-spinner fa-spin' })
            );

            let req = {
                skuCode: $("#skuCode").val()
            }

            $.ajax({
                url: api + 'inventory/product/sku',
                type: 'POST',
                data: JSON.stringify(req),
                contentType: 'application/json; charset=utf-8',
                cache: false,
                processData: false,
                success: function (data) {
                    if (data && data.id != undefined) {
                        $(this).addProductToCart(data);
                        $("#searchBarCode").get(0).reset();
                        $("#basic-addon2").empty();
                        $("#basic-addon2").append(
                            $('<i>', { class: 'glyphicon glyphicon-ok' })
                        )
                    }
                    else if (data && data.quantity < 1) {
                        Swal.fire(
                            'Out of stock!',
                            'This item is currently unavailable',
                            'info'
                        );
                    }
                    else {

                        Swal.fire(
                            'Not Found!',
                            '<b>' + $("#skuCode").val() + '</b> is not a valid barcode!',
                            'warning'
                        );

                        $("#searchBarCode").get(0).reset();
                        $("#basic-addon2").empty();
                        $("#basic-addon2").append(
                            $('<i>', { class: 'glyphicon glyphicon-ok' })
                        )
                    }

                }, error: function (data) {
                    if (data.status === 422) {
                        $(this).showValidationError(data);
                        $("#basic-addon2").append(
                            $('<i>', { class: 'glyphicon glyphicon-remove' })
                        )
                    }
                    else if (data.status === 404) {
                        $("#basic-addon2").empty();
                        $("#basic-addon2").append(
                            $('<i>', { class: 'glyphicon glyphicon-remove' })
                        )
                    }
                    else {
                        $(this).showServerError();
                        $("#basic-addon2").empty();
                        $("#basic-addon2").append(
                            $('<i>', { class: 'glyphicon glyphicon-warning-sign' })
                        )
                    }
                }
            });

        }


        $("#searchBarCode").on('submit', function (e) {
            barcodeSearch(e);
        });



        $('body').on('click', '#jq-keyboard button', function (e) {
            let pressed = $(this)[0].className.split(" ");
            if ($("#skuCode").val() != "" && pressed[2] == "enter") {
                barcodeSearch(e);
            }
        });



        $.fn.addProductToCart = function (data) {
            item = {
                id: data.id,
                product_name: data.name,
                sku: data.sku,
                price: data.price,
                quantity: 1
            };

            if ($(this).isExist(item)) {
                $(this).qtIncrement(index);
            } else {
                cart.push(item);
                $(this).renderTable(cart)
            }
        }


        $.fn.isExist = function (data) {
            let toReturn = false;
            $.each(cart, function (index, value) {
                if (value.id == data.id) {
                    $(this).setIndex(index);
                    toReturn = true;
                }
            });
            return toReturn;
        }


        $.fn.setIndex = function (value) {
            index = value;
        }


        $.fn.calculateCart = function () {
            let subtotal = 0;
            let grossTotal = 0;

            // count total items in cart
            $('#total').text(cart.length || 0);

            // calculate subtotal (price * quantity)
            if (cart && cart.length > 0) {
                $.each(cart, function (index, data) {
                    if (data && data.quantity && data.price) {
                        subtotal += parseFloat(data.quantity) * parseFloat(data.price);
                    }
                });
            }

            // get discount percentage
            let discountPercent = parseFloat($("#inputDiscount").val()) || 0;

            // calculate discount amount (percentage of subtotal)
            discountAmount = (subtotal * discountPercent) / 100;

            // apply discount
            let total = subtotal - discountAmount;

            // safety: discount cannot exceed subtotal
            if (discountPercent >= 100) {
                discountAmount = subtotal;
                total = 0;
                $("#inputDiscount").val(0);
            }

            // update price (after discount)
            $('#price').text((settings?.symbol || '$') + subtotal.toFixed(2));

            // assign subtotal (before discount)
            subTotal = subtotal;

            // calculate VAT if enabled (you had commented logic)
            // if (settings.charge_tax) {
            //     totalVat = ((total * vat) / 100);
            //     grossTotal = total + totalVat;
            // } else {
            //     grossTotal = total;
            // }

            // without tax
            grossTotal = total;

            // final total
            orderTotal = grossTotal.toFixed(2);

            // update UI
            $("#gross_price").text((settings?.symbol || '$') + grossTotal.toFixed(2));
            $("#payablePrice").val(grossTotal);
        };




        $.fn.renderTable = function (cartList) {
            $('#cartTable > tbody').empty();
            $(this).calculateCart();
            
            if (!cartList || cartList.length === 0) {
                return;
            }
            
            $.each(cartList, function (index, data) {
                $('#cartTable > tbody').append(
                    $('<tr>').append(
                        $('<td>', { text: index + 1 }),
                        $('<td>', { text: data.product_name }),
                        $('<td>').append(
                            $('<div>', { class: 'input-group' }).append(
                                $('<div>', { class: 'input-group-btn btn-sm' }).append(
                                    $('<button>', {
                                        class: 'btn btn-default btn-sm',
                                        onclick: '$(this).qtDecrement(' + index + ')'
                                    }).append(
                                        $('<i>', { class: 'fa fa-minus' })
                                    )
                                ),
                                $('<span>', {
                                    class: 'form-control text-center',
                                    text: data.quantity
                                }),
                                $('<div>', { class: 'input-group-btn btn-sm' }).append(
                                    $('<button>', {
                                        class: 'btn btn-default btn-sm',
                                        onclick: '$(this).qtIncrement(' + index + ')'
                                    }).append(
                                        $('<i>', { class: 'fa fa-plus' })
                                    )
                                )
                            )
                        ),
                        $('<td>', { text: settings.symbol + data.price.toFixed(2) }),
                        $('<td>').append(
                            $('<button>', {
                                class: 'btn btn-danger btn-xs',
                                onclick: '$(this).deleteFromCart(' + index + ')'
                            }).append(
                                $('<i>', { class: 'fa fa-times' })
                            )
                        )
                    )
                )
            })
        };


        $.fn.deleteFromCart = function (index) {
            cart.splice(index, 1);
            $(this).renderTable(cart);

        }


        $.fn.qtIncrement = function (i) {

            if (!cart || !cart[i]) {
                return;
            }

            item = cart[i];

            let product = allProducts.filter(function (selected) {
                return selected.id == parseInt(item.id);
            });

            if (product.length > 0 && product[0].stock == 1) {
                if (item.quantity < product[0].quantity) {
                    item.quantity += 1;
                    $(this).renderTable(cart);
                }
                else {
                    Swal.fire(
                        'No more stock!',
                        'You have already added all the available stock.',
                        'info'
                    );
                }
            }
            else {
                item.quantity += 1;
                $(this).renderTable(cart);
            }

        }


        $.fn.qtDecrement = function (i) {
            if (!cart || !cart[i]) {
                return;
            }
            
            item = cart[i];
            if (item.quantity > 1) {
                item.quantity -= 1;
                $(this).renderTable(cart);
            }
        }


        $.fn.qtInput = function (i) {
            if (!cart || !cart[i]) {
                return;
            }
            
            item = cart[i];
            item.quantity = $(this).val();
            $(this).renderTable(cart);
        }


        $.fn.cancelOrder = function () {

            if (cart.length > 0) {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You are about to remove all items from the cart.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, clear it!'
                }).then((result) => {

                    if (result.value) {

                        cart = [];
                        $(this).renderTable(cart);
                        holdOrder = 0;
                        $(this).clearOrderData();

                        Swal.fire(
                            'Cleared!',
                            'All items have been removed.',
                            'success'
                        )
                    }
                });
            }

        }

        $.fn.clearOrderData = function () {
            // Clear cart
            cart = [];
            
            // Clear form fields
            $("#customer option:selected").removeAttr('selected');
            // $("#customer option").filter(function () {
            //     return $(this).text() == "Walk in customer";
            // }).prop("selected", true);
            $("#customer option").first().prop("selected", true);
            $("#customer").trigger("chosen:updated");
            $("#order_type").val("Dine-In");
            $("#refNumber").val('');
            $("#inputDiscount").val('');
            $("#payment").val('');
            $("#change").text('');
            $("#accountType").val('');
            $('#deliveryAddress').hide();
            $('#deliveryAddress').val('');
            
            // Reset payment type
            paymentType = 0;
            $("#cash").addClass('active').siblings().removeClass('active');
            $("#cardInfo").hide();
            $("#onlinePaymentInfo").hide();
            $("#confirmPayment").hide();
            
            // Clear hold order
            holdOrder = 0;
            
            // Re-render table
            $(this).renderTable(cart);
        }


        $("#payButton").on('click', function () {
            if (cart.length != 0) {
                $("#paymentModel").modal('toggle');
            } else {
                Swal.fire(
                    'Oops!',
                    'There is nothing to pay!',
                    'warning'
                );
            }

        });


        $("#hold").on('click', function () {

            if (cart.length != 0) {

                $("#dueModal").modal('toggle');
            } else {
                Swal.fire(
                    'Oops!',
                    'There is nothing to hold!',
                    'warning'
                );
            }
        });


        function printJobComplete() {
            alert("print job complete");
        }


        $.fn.submitDueOrder = function (status) {

            let items = "";
            let payment = 0;

            cart.forEach(item => {

                items += `<div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 13px;">
                    <span style="flex: 2; text-align: left;">${item.product_name}</span>
                    <span style="flex: 0.5; text-align: center;">${item.quantity}</span>
                    <span style="flex: 1; text-align: right;">${settings.symbol}${parseFloat(item.price).toFixed(2)}</span>
                </div>`;

            });

            let currentTime = new Date(moment());

            let discount = $("#inputDiscount").val();
            let customerInput = $("#customer").val();
            let customer;
            try {
                // only parse if it looks like JSON
                if (customerInput.startsWith('{') || customerInput.startsWith('[')) {
                    customer = JSON.parse(customerInput);
                } else {
                    customer = customerInput; // plain string
                }
            } catch (e) {
                customer = customerInput; // fallback
            }

            let order_type = $("#order_type").val();
            let date = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
            let paid = $("#payment").val() == "" ? "" : parseFloat($("#payment").val()).toFixed(2);
            let change = $("#change").text() == "" ? "" : parseFloat($("#change").text()).toFixed(2);
            let refNumber = $("#refNumber").val();
            account_type = $("#accountType").val();
            let orderNumber = holdOrder;
            let type = "";
            let tax_row = "";


            switch (paymentType) {

                case 1: type = "Cheque";
                    break;

                case 2: type = "Card";
                    break;

                case 3: type = "Online";
                    break;

                default: type = "Cash";

            }


            if (paid != "") {
                payment = `<div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 13px;">
                        <span>Paid</span>
                        <span>${settings.symbol + paid}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>Change</span>
                        <span>${settings.symbol + Math.abs(change).toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <span>Method</span>
                        <span>${type} ${paymentType === 3 && account_type ? `(${account_type})` : ''}</span>
                    </div>`
            }



            // if (settings.charge_tax) {
            //     tax_row = `<tr>
            //         <td>Vat(${settings.percentage})% </td>
            //         <td>:</td>
            //         <td>${settings.symbol}${parseFloat(totalVat).toFixed(2)}</td>
            //     </tr>`;
            // }



            if (status == 0) {

                if ($("#customer").val() == 'Walk in customer' && $("#refNumber").val() == "") {
                    Swal.fire(
                        'Reference Required!',
                        'You either need to select a customer <br> or enter a table!',
                        'warning'
                    )

                    return;
                }
            }


            $(".loading").show();


            if (holdOrder != 0) {

                orderNumber = holdOrder;
                method = 'PUT'
            }
            else {
                orderNumber = Math.floor(Date.now() / 1000);
                method = 'POST'
            }

            if(order_type === 'Delivery') {
            delAddr = $("#deliveryAddress").val();
        }


            const logoUrl = (function(){
                const src = settings.img || '';
                if (!src) return '';
                if (/^(data:|https?:\/\/|file:\/\/)/i.test(src)) return src;
                return `${api}${src}`;
            })();

            receipt = `<div style="font-family: 'Courier New', monospace; font-size: 14px; width: 100%; max-width: 300px; margin: 0; padding: 2px; background: white;" class="receipt">                            
        <div style="text-align: center; margin-bottom: 5px;">
         ${logoUrl ? '<img style="max-width: 100px; max-height: 80px;" src ="' + logoUrl + '" /><br>' : '<div style=\"font-size: 20px; font-weight: bold; margin-bottom: 5px;\">' + settings.store + '</div>'}
            <div style="font-size: 13px; line-height: 1.3;">${settings.address_one}</div>
            <div style="font-size: 13px; line-height: 1.3;">${settings.address_two}</div>
            ${settings.contact != '' ? '<div style="font-size: 13px;">Tel: ' + settings.contact + '</div>' : ''} 
        </div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
            <div style="font-size: 13px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Order No:</span><span>${orderNumber}</span></div>
            ${order_type === 'Dine-In' ? `<div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Table No:</span><span>${refNumber == "" ? orderNumber : refNumber}</span></div>` : ''}
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Customer:</span><span>${customer == 0 || customer === '0' ? 'Walk in customer' : (typeof customer === 'object' ? customer.name : customer)}</span></div>
            ${order_type === 'Delivery' && (customer != 0 && customer !== '0') && typeof customer === 'object' ? `
                <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Phone:</span><span>${customer.phone || 'N/A'}</span></div>
                <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Address:</span><span>${delAddr || 'N/A'}</span></div>
            ` : ''}
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Order Type:</span><span>${order_type}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Date:</span><span>${date}</span></div>
            </div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
        <div style="font-size: 13px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px;">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
            </div>
            ${items}                
     
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span style="font-weight: bold;">Subtotal</span>
                <span style="font-weight: bold;">${settings.symbol}${subTotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `<div style="display: flex; justify-content: space-between;">
                <span>Discount</span>
                <span>${settings.symbol}${parseFloat(discountAmount).toFixed(2)} (${discount}%)</span>
            </div>` : ''}
            
        
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 8px; padding-top: 5px; border-top: 1px solid #000;">
                <span>TOTAL</span>
                <span>${settings.symbol}${parseFloat(orderTotal).toFixed(2)}</span>
            </div>
            ${payment == 0 ? '' : payment}
            </div>
            <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
            <div style="text-align: center; font-size: 12px; margin-top: 5px; margin-bottom: 10px;">
             ${settings.footer}
             </div>
             
            <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
            Follow US Facebook
            <div style="text-align: center; font-size: 12px; margin-top: 5px; margin-bottom: 10px;">
             fb.com/flavorspkofficial <br>
             
            <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
            </div>`;


            if (status == 3) {
                if (cart.length > 0) {
                    autoPrint = $('#autoPrintReceipt').is(':checked');
                    window.api.printReceipt(receipt, autoPrint);

                    $(".loading").hide();
                    return;

                }
                else {

                    $(".loading").hide();
                    return;
                }
            }


            // Set account_type for online payments
            if (paymentType === 3) {
                account_type = $("#accountType").val();
                if (!account_type) {
                    Swal.fire(
                        'Payment Method Required!',
                        'Please select a payment method for online payment.',
                        'warning'
                    );
                    return;
                }
            } else {
                account_type = '';
            }

            if(customer.address)
                customer.address = delAddr || '';

            let data = {
                order: orderNumber,
                ref_number: refNumber,
                discount: discount,
                customer: customer,
                status: status,
                subtotal: parseFloat(subTotal).toFixed(2),
                order_type: order_type,
                items: cart,
                date: currentTime,
                payment_method: type,
                // payment_info: $("#paymentInfo").val(),
                account_type: account_type,
                account_no: account_no,
                total: orderTotal,
                paid: paid,
                change: change,
                till: platform.till,
                mac: platform.mac,
                user: user.fullname,
            }


            $.ajax({
                url: api + 'new',
                type: method,
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                cache: false,
                processData: false,
                success: function (data) {

                    cart = [];
                    $('#viewTransaction').html('');
                    $('#viewTransaction').html(receipt);
                    $('#orderModal').modal('show');
                    loadProducts();
                    loadCustomers();
                    loadOrderType();
                    $(".loading").hide();
                    $("#dueModal").modal('hide');
                    $("#paymentModel").modal('hide');
                    $(this).getHoldOrders();
                    $(this).getCustomerOrders();
                    $(this).renderTable(cart);
                    $(this).clearOrderData();

                }, error: function (data) {
                    $(".loading").hide();
                    $("#dueModal").modal('toggle');
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong!",
                    });

                }
            });

            $("#refNumber").val('');
            $("#change").text('');
            $("#payment").val('');

        }


        $.get(api + 'on-hold', function (data) {
            holdOrderList = data;
            holdOrderlocation.empty();
            clearInterval(dotInterval);
            $(this).randerHoldOrders(holdOrderList, holdOrderlocation, 1);
        });


        $.fn.getHoldOrders = function () {
            $.get(api + 'on-hold', function (data) {
                holdOrderList = data;
                clearInterval(dotInterval);
                holdOrderlocation.empty();
                $(this).randerHoldOrders(holdOrderList, holdOrderlocation, 1);
            });
        };

         $.fn.tryParseJSON = function (str) {
            try {
                var obj = JSON.parse(str);
                if (obj && typeof obj === "object") {
                    return obj;
                }
            } catch (e) {}
            return null;
        }


        $.fn.randerHoldOrders = function (data, renderLocation, orderType) {
            $.each(data, function (index, order) {
                var customerObj = $(this).tryParseJSON(order.customer);
                var customerName = customerObj ? customerObj.name : order.customer.replace(/(^"|"$)/g, "");

                var itemsArray = $(this).tryParseJSON(order.items);
                var itemCount = Array.isArray(itemsArray) ? itemsArray.length : 0;
                $(this).calculatePrice(order);
                renderLocation.append(
                    $('<div>', { class: orderType == 1 ? 'col-md-3 order' : 'col-md-3 customer-order' }).append(
                        $('<a>').append(
                            $('<div>', { class: 'card-box order-box' }).append(
                                $('<p>').append(
                                    $('<b>', { text: 'Table :' }),
                                    $('<span>', { text: order.ref_number, class: 'ref_number' }),
                                    $('<br>'),
                                    $('<b>', { text: 'Order Type :' }),
                                    $('<span>', { text: order.order_type, class: 'order_type' }),
                                    $('<br>'),
                                    $('<b>', { text: 'Price :' }),
                                    $('<span>', { text: order.total, class: "label label-info", style: 'font-size:14px;' }),
                                    $('<br>'),
                                    $('<b>', { text: 'Items :' }),
                                    $('<span>', { text: itemCount }),
                                    $('<br>'),
                                    $('<b>', { text: 'Customer :' }),
                                    $('<span>', { text: customerName, class: 'customer_name' })
                                ),
                                $('<button>', { class: 'btn btn-danger del', onclick: '$(this).deleteOrder(' + index + ',' + orderType + ')' }).append(
                                    $('<i>', { class: 'fa fa-trash' })
                                ),

                                $('<button>', { class: 'btn btn-default', onclick: '$(this).orderDetails(' + index + ',' + orderType + ')' }).append(
                                    $('<span>', { class: 'fa fa-shopping-basket' })
                                )
                            )
                        )
                    )
                )
            })
        }


        $.fn.calculatePrice = function (data) {
            let subtotal = 0;

            // calculate subtotal
            $.each(data.products, function (index, product) {
                subtotal += product.price * product.quantity;
            });

            // tax & charges
            // let vat = (subtotal * (data.vat || 0)) / 100;
            let gst = (subtotal * (data.gst || 0)) / 100;
            let sc  = (subtotal * (data.sc  || 0)) / 100;

            // discount as percentage
            let discount = (subtotal * (data.discount || 0)) / 100;

            // final total
            let totalPrice = (subtotal + gst + sc - discount).toFixed(0);

            let dt =  {
                subtotal: subtotal.toFixed(0),
                gst: gst.toFixed(0),
                serviceCharges: sc.toFixed(0),
                discount: discount.toFixed(0),
                total: totalPrice
            };
            return totalPrice;
        };



        $.fn.orderDetails = function (index, orderType) {

            $('#refNumber').val('');
            if (orderType == 1) {
                const order = holdOrderList[index];

                // Set reference number
                $('#refNumber').val(order.ref_number);

                // Parse customer safely
                let customerObj = null;
                if (order.customer) {
                    try {
                        customerObj = typeof order.customer === "string" ? JSON.parse(order.customer) : order.customer;
                    } catch (e) {
                        customerObj = { name: order.customer };
                    }
                }

                // Set customer select
                if (customerObj && customerObj.name) {
                    $("#customer option:selected").removeAttr('selected');
                    $("#customer option").filter(function () {
                        return $(this).text().trim().startsWith(customerObj.name);
                    }).prop("selected", true);
                } else {
                    $("#customer option:selected").removeAttr('selected');
                    $("#customer option").filter(function () {
                        return $(this).text() == "Walk in customer";
                    }).prop("selected", true);
                }
                $("#customer").trigger("chosen:updated");

                // Set order type
                if (order.order_type) {
                    $("#order_type").val(order.order_type);
                    $("#order_type").trigger("change");
                }

                holdOrder = order.id;
                cart = [];

                // Parse items safely
                let items = order.items;
                if (typeof items === "string") {
                    try { items = JSON.parse(items); } catch(e) { items = []; }
                }

                $.each(items, function (i, product) {
                    let item = {
                        id: product.id,
                        product_name: product.product_name,
                        sku: product.sku,
                        price: product.price,
                        quantity: product.quantity
                    };
                    cart.push(item);
                });

                $(this).renderTable(cart);
                $("#holdOrdersModal").modal('hide');
                $("#customerModal").modal('hide');
            }
            else if (orderType == 2) {
                const order = customerOrderList[index];

                // Set reference number
                $('#refNumber').val(order.ref_number);

                // Parse customer safely
                let customerObj = null;
                if (order.customer) {
                    try {
                        customerObj = typeof order.customer === "string" ? JSON.parse(order.customer) : order.customer;
                    } catch (e) {
                        customerObj = { name: order.customer };
                    }
                }

                // Set customer select
                if (customerObj && customerObj.name) {
                    $("#customer option:selected").removeAttr('selected');
                    $("#customer option").filter(function () { 
                        return $(this).text().trim().startsWith(customerObj.name);
                    }).prop("selected", true);
                } else {
                    $("#customer option:selected").removeAttr('selected');
                    $("#customer option").filter(function () {
                        return $(this).text() == "Walk in customer";
                    }).prop("selected", true);
                }
                $("#customer").trigger("chosen:updated");

                // Set order type
                if (order.order_type) {
                    $("#order_type").val(order.order_type);
                    $("#order_type").trigger("change");
                }

                holdOrder = order.id;
                cart = [];

                // Parse items safely
                let items = order.items;
                if (typeof items === "string") {
                    try { items = JSON.parse(items); } catch(e) { items = []; }
                }

                $.each(items, function (i, product) {
                    let item = {
                        id: product.id,
                        product_name: product.product_name,
                        sku: product.sku,
                        price: product.price,
                        quantity: product.quantity
                    };
                    cart.push(item);
                });

                $(this).renderTable(cart);
                $("#customerOrdersModal").modal('hide');
                $("#customerModal").modal('hide');
            }

            $(this).renderTable(cart);
            $("#holdOrdersModal").modal('hide');
            $("#customerModal").modal('hide');
        }


        $.fn.deleteOrder = function (index, type) {

            switch (type) {
                case 1: deleteId = holdOrderList[index].id;
                    break;
                case 2: deleteId = customerOrderList[index].id;
            }

            let data = {
                id: deleteId,
            }

            Swal.fire({
                title: "Delete order?",
                text: "This will delete the order. Are you sure you want to delete!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'delete',
                        type: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json; charset=utf-8',
                        cache: false,
                        success: function (data) {

                            $(this).getHoldOrders();
                            $(this).getCustomerOrders();

                            Swal.fire(
                                'Deleted!',
                                'You have deleted the order!',
                                'success'
                            )

                        }, error: function (data) {
                            $(".loading").hide();

                        }
                    });
                }
            });
        }



        $.fn.getCustomerOrders = function () {
            $.get(api + 'customer-orders', function (data) {
                clearInterval(dotInterval);
                customerOrderList = data;
                customerOrderLocation.empty();
                $(this).randerHoldOrders(customerOrderList, customerOrderLocation, 2);
            });
        }



        $('#saveCustomer').on('submit', function (e) {

            e.preventDefault();

            let custData = {
                id: Math.floor(Date.now() / 1000),
                name: $('#userName').val(),
                phone: $('#phoneNumber').val(),
                email: $('#emailAddress').val(),
                address: $('#userAddress').val()
            }

            $.ajax({
                url: api + 'customers/customer',
                type: 'POST',
                data: JSON.stringify(custData),
                contentType: 'application/json; charset=utf-8',
                cache: false,
                processData: false,
                success: function (data) {
                    $("#newCustomer").modal('hide');
                    Swal.fire("Customer added!", "Customer added successfully!", "success");
                    $("#customer option:selected").removeAttr('selected');
                    $('#customer').append(
                        $('<option>', { 
                                    text: custData.name, 
                                    value: JSON.stringify({
                                        id: custData.id,
                                        name: custData.name,
                                        phone: custData.phone,
                                        email: custData.email,
                                        address: custData.address
                                    }),
                                    selected: 'selected'
                                })
                    );

                    $('#customer')
                        .val(JSON.stringify({
                            id: custData.id,
                            name: custData.name,
                            phone: custData.phone,
                            email: custData.email,
                            address: custData.address
                        }))
                        .trigger('chosen:updated');


                }, error: function (data) {
                    $("#newCustomer").modal('hide');
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Something went wrong!",
                    });
                }
            })

            $('#userName').val('');
            $('#phoneNumber').val('');
        })


        $("#confirmPayment").hide();

        $("#cardInfo").hide();
        $("#onlinePaymentInfo").hide();

        $("#payment").on('input', function () {
            $(this).calculateChange();
        });

        $.fn.calculateChange = function () {
            let paid = parseFloat($("#payment").val()) || 0;
            let total = parseFloat($("#payablePrice").val()) || 0;
            let change = paid - total;

            if (change >= 0) {
                $("#change").text(change.toFixed(2));
                $("#confirmPayment").show();
            } 
            else {
                $("#change").text("");
                $("#confirmPayment").hide();
                
            }
        };

        $.fn.go = function (number, isRefNumber) {
            if (isRefNumber) {
                $("#refNumber").val($("#refNumber").val() + number);
            } else {
                $("#payment").val($("#payment").val() + number);
                $(this).calculateChange();
            }
        };

        $.fn.digits = function () {
            let current = $("#payment").val();
            if (current.indexOf('.') === -1) {
                $("#payment").val(current + '.');
            }
        };


        $("#confirmPayment").on('click', function () {
            if ($('#payment').val() == "") {
                Swal.fire(
                    'Nope!',
                    'Please enter the amount that was paid!',
                    'warning'
                );
            }
            else {
                $(this).submitDueOrder(1);
            }
        });

        // Payment method selection handlers
        $("#cash").on('click', function () {
            paymentType = 0;
            $("#cardInfo").hide();
            $("#onlinePaymentInfo").hide();
            $("#confirmPayment").show();
            $(this).addClass('active').siblings().removeClass('active');
        });

        $("#online").on('click', function () {
            paymentType = 3;
            $("#cardInfo").hide();
            $("#onlinePaymentInfo").show();
            $("#confirmPayment").show();
            $(this).addClass('active').siblings().removeClass('active');
        });


        $('#transactions').click(function () {
            loadTransactions();
            loadUserList();

            $('#pos_view').hide();
            $('#pointofsale').show();
            $('#transactions_view').show();
            $(this).hide();

        });


        $('#pointofsale').click(function () {
            $('#pos_view').show();
            $('#transactions').show();
            $('#transactions_view').hide();
            $(this).hide();
        });


        $("#viewRefOrders").click(function () {
            setTimeout(function () {
                $("#holdOrderInput").focus();
            }, 500);
        });


        $("#viewCustomerOrders").click(function () {
            setTimeout(function () {
                $("#holdCustomerOrderInput").focus();
            }, 500);
        });


        $('#newProductModal').click(function () {
            $('#saveProduct').get(0).reset();
            $('#current_img').text('');
        });


        $('#saveProduct').submit(function (e) {
            e.preventDefault();

            $(this).attr('action', api + 'inventory/product');
            $(this).attr('method', 'POST');

            $(this).ajaxSubmit({
                contentType: 'application/json',
                success: function (response) {

                    $('#saveProduct').get(0).reset();
                    $('#current_img').text('');

                    loadProducts();
                    Swal.fire({
                        title: 'Product Saved',
                        text: "Select an option below to continue.",
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Add another',
                        cancelButtonText: 'Close'
                    }).then((result) => {

                        if (!result.value) {
                            $("#newProduct").modal('hide');
                        }
                    });
                }, error: function (data) {
                    console.log(data);
                }
            });

        });



        $('#saveCategory').submit(function (e) {
            e.preventDefault();

            if ($('#category_id').val() == "") {
                method = 'POST';
            }
            else {
                method = 'PUT';
            }

            $.ajax({
                type: method,
                url: api + 'categories/category',
                data: $(this).serialize(),
                success: function (data, textStatus, jqXHR) {
                    $('#saveCategory').get(0).reset();
                    loadCategories();
                    loadProducts();
                    Swal.fire({
                        title: 'Category Saved',
                        text: "Select an option below to continue.",
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Add another',
                        cancelButtonText: 'Close'
                    }).then((result) => {

                        if (!result.value) {
                            $("#newCategory").modal('hide');
                        }
                    });
                }, error: function (data) {
                    console.log(data);
                }

            });


        });


        $.fn.editProduct = function (index) {

            $('#Products').modal('hide');

            // Clear previous selection
            $("#category option").prop("selected", false);
            
            // Set the correct category
            $("#category option").filter(function () {
                return $(this).val() == allProducts[index].category;
            }).prop("selected", true);

            $('#productName').val(allProducts[index].name);
            $('#product_price').val(allProducts[index].price);
            $('#quantity').val(allProducts[index].quantity);
            $('#product_sku').val(allProducts[index].sku || '');

            $('#product_id').val(allProducts[index].id);
            $('#img').val(allProducts[index].img);

            if (allProducts[index].img != "") {

                $('#imagename').hide();
                $('#current_img').html(`<img src="${ allProducts[index].img}" alt="">`);
                $('#rmv_img').show();
            }

            if (allProducts[index].stock == 0) {
                $('#stock').prop("checked", true);
            }

            $('#newProduct').modal('show');
        }


        $("#userModal").on("hide.bs.modal", function () {
            $('.perms').hide();
        });


        $.fn.editUser = function (index) {

            user_index = index;

            $('#Users').modal('hide');

            $('.perms').show();

            $("#user_id").val(allUsers[index].id);
            $('#fullname').val(allUsers[index].fullname);
            $('#username').val(allUsers[index].username);
            $('#password').val(atob(allUsers[index].password));

            if (allUsers[index].perm_products == 1) {
                $('#perm_products').prop("checked", true);
            }
            else {
                $('#perm_products').prop("checked", false);
            }

            if (allUsers[index].perm_categories == 1) {
                $('#perm_categories').prop("checked", true);
            }
            else {
                $('#perm_categories').prop("checked", false);
            }

            if (allUsers[index].perm_transactions == 1) {
                $('#perm_transactions').prop("checked", true);
            }
            else {
                $('#perm_transactions').prop("checked", false);
            }

            if (allUsers[index].perm_users == 1) {
                $('#perm_users').prop("checked", true);
            }
            else {
                $('#perm_users').prop("checked", false);
            }

            if (allUsers[index].perm_settings == 1) {
                $('#perm_settings').prop("checked", true);
            }
            else {
                $('#perm_settings').prop("checked", false);
            }

            $('#userModal').modal('show');
        }


        $.fn.editCategory = function (index) {
            $('#Categories').modal('hide');
            $('#categoryName').val(allCategories[index].name);
            $('#category_id').val(allCategories[index].id);
            $('#newCategory').modal('show');
        }


        $.fn.deleteProduct = function (id) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You are about to delete this product.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'inventory/product/' + id,
                        type: 'DELETE',
                        success: function (result) {
                            loadProducts();
                            Swal.fire(
                                'Done!',
                                'Product deleted',
                                'success'
                            );

                        }
                    });
                }
            });
        }


        $.fn.deleteUser = function (id) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You are about to delete this user.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete!'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'users/user/' + id,
                        type: 'DELETE',
                        success: function (result) {
                            loadUserList();
                            Swal.fire(
                                'Done!',
                                'User deleted',
                                'success'
                            );

                        }
                    });
                }
            });
        }


        $.fn.deleteCategory = function (id) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You are about to delete this category.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'categories/category/' + id,
                        type: 'DELETE',
                        success: function (result) {
                            loadCategories();
                            Swal.fire(
                                'Done!',
                                'Category deleted',
                                'success'
                            );

                        }
                    });
                }
            });
        }


        $('#productModal').click(function () {
            loadProductList();
        });


        $('#usersModal').click(function () {
            loadUserList();
        });


        $('#categoryModal').click(function () {
            loadCategoryList();
        });


        function loadUserList() {

            let counter = 0;
            let user_list = '';
            $('#user_list').empty();
            $('#userList').DataTable().destroy();

            $.get(api + 'users/all', function (users) {



                allUsers = [...users];

                users.forEach((user, index) => {

                    state = [];
                    let class_name = '';

                    if (user.status != "") {
                        state = user.status.split("_");

                        switch (state[0]) {
                            case 'Logged In': class_name = 'btn-default';
                                break;
                            case 'Logged Out': class_name = 'btn-light';
                                break;
                        }
                    }

                    counter++;
                    user_list += `<tr>
            <td>${user.fullname}</td>
            <td>${user.username}</td>
            <td class="${class_name}">${state.length > 0 ? state[0] : ''} <br><span style="font-size: 11px;"> ${state.length > 0 ? moment(state[1]).format('hh:mm A DD MMM YYYY') : ''}</span></td>
            <td>${user.id == 1 ? '<span class="btn-group"><button class="btn btn-dark"><i class="fa fa-edit"></i></button><button class="btn btn-dark"><i class="fa fa-trash"></i></button></span>' : '<span class="btn-group"><button onClick="$(this).editUser(' + index + ')" class="btn btn-warning"><i class="fa fa-edit"></i></button><button onClick="$(this).deleteUser(' + user.id + ')" class="btn btn-danger"><i class="fa fa-trash"></i></button></span>'}</td></tr>`;

                    if (counter == users.length) {

                        $('#user_list').html(user_list);

                        $('#userList').DataTable({
                            "order": [[1, "desc"]]
                            , "autoWidth": false
                            , "info": true
                            , "JQueryUI": true
                            , "ordering": true
                            , "paging": false
                        });
                    }

                });

            });
        }


        async function loadProductList() {
            let products = [...allProducts];
            let product_list = '';
            $('#product_list').empty();

            if ($.fn.DataTable.isDataTable('#productList')) {
                $('#productList').DataTable().destroy();
            }

            for (let index = 0; index < products.length; index++) {
                const product = products[index];

                // Build image URL
                let imgUrl = "./assets/images/default.jpg";
                if (product.img) {
                    imgUrl = `${api}images/${product.img}`;
                }

                let category = allCategories.filter(cat => cat.id == product.category);

                product_list += `
                    <tr>
                        <td><svg id="barcode_${product.id}"></svg></td>
                        <td>
                            <img style="max-height:50px; max-width:50px; border:1px solid #ddd;" 
                                src="${imgUrl}" 
                                id="product_img_${product.id}">
                        </td>
                        <td>${product.name}</td>
                        <td>${settings.symbol}${parseFloat(product.price).toFixed(2)}</td>
                        <td>${product?.sku}</td>
                        <td>${product.stock == 1 ? (product.quantity > 0 ? product.quantity : 'N/A') : 'N/A'}</td>
                        <td>${category.length > 0 ? category[0].name : ''}</td>
                        <td class="nobr">
                            <span class="btn-group">
                                <button onClick="$(this).editProduct(${index})" class="btn btn-warning btn-sm">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button onClick="$(this).deleteProduct(${product.id})" class="btn btn-danger btn-sm">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </span>
                        </td>
                    </tr>`;
            }

            // Render table rows
            $('#product_list').html(product_list);

            // Generate barcodes
            products.forEach(pro => {
                JsBarcode(`#barcode_${pro.id}`, pro.id, {
                    width: 2,
                    height: 25,
                    fontSize: 14
                });
            });

            // Initialize DataTable
            $('#productList').DataTable({
                order: [[1, "desc"]],
                autoWidth: false,
                info: true,
                jQueryUI: true,
                ordering: true,
                paging: false
            });
        }




        function loadCategoryList() {

            let category_list = '';
            let counter = 0;
            $('#category_list').empty();
            $('#categoryList').DataTable().destroy();

            allCategories.forEach((category, index) => {

                counter++;

                category_list += `<tr>
     
            <td>${category.name}</td>
            <td><span class="btn-group"><button onClick="$(this).editCategory(${index})" class="btn btn-warning"><i class="fa fa-edit"></i></button><button onClick="$(this).deleteCategory(${category.id})" class="btn btn-danger"><i class="fa fa-trash"></i></button></span></td></tr>`;
            });

            if (counter == allCategories.length) {

                $('#category_list').html(category_list);
                $('#categoryList').DataTable({
                    "autoWidth": false
                    , "info": true
                    , "JQueryUI": true
                    , "ordering": true
                    , "paging": false

                });
            }
        }


        $.fn.serializeObject = function () {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };



        $('#log-out').click(async function () {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You are about to log out.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Logout'
            });

            if (result.isConfirmed) {
                try {
                    // Optional: call API logout
                    await $.get(api + 'users/logout/' + user.id);

                    // Clear stored auth and user
                    await storage.delete('auth');
                    await storage.delete('user');

                    // Reload app
                    window.api.reload();
                } catch (err) {
                    console.error("Logout failed:", err);
                    Swal.fire('Error', 'Failed to log out', 'error');
                }
            }
        });



        $('#settings_form').on('submit', function (e) {
            e.preventDefault();
            let formData = $(this).serializeObject();
            let mac_address;

            api = 'http://' + host + ':' + port + '/api/';

            window.api.getMacAddress().then(mac => {
                mac_address = mac;      // first usage
            }).catch(err => {
                console.error("Failed to get MAC address:", err);
});


            formData['app'] = $('#app').find('option:selected').text();
            formData['mac'] = mac_address;
            formData['till'] = 1;

            $('#settings_form').append('<input type="hidden" name="app" value="' + formData.app + '" />');

            if (formData.percentage != "" && !$.isNumeric(formData.percentage)) {
                Swal.fire(
                    'Oops!',
                    'Please make sure the tax value is a number',
                    'warning'
                );
            }
            else {
                storage.set('settings', formData);

                $(this).attr('action', api + 'settings/post');
                $(this).attr('method', 'POST');


                $(this).ajaxSubmit({
                    contentType: 'application/json',
                    success: function (response) {

                        window.api.reload();

                    }, error: function (data) {
                        console.log(data);
                    }

                });

            }

        });



        $('#net_settings_form').on('submit', function (e) {
            e.preventDefault();
            let formData = $(this).serializeObject();

            if (formData.till == 0 || formData.till == 1) {
                Swal.fire(
                    'Oops!',
                    'Please enter a number greater than 1.',
                    'warning'
                );
            }
            else {
                if (isNumeric(formData.till)) {
                    formData['app'] = $('#app').find('option:selected').text();
                    storage.set('settings', formData);
                    window.api.reload();
                }
                else {
                    Swal.fire(
                        'Oops!',
                        'Till number must be a number!',
                        'warning'
                    );
                }

            }

        });



        $('#saveUser').on('submit', function (e) {
            e.preventDefault();
            let formData = $(this).serializeObject();

            if (ownUserEdit) {
                if (formData.password != atob(user.password)) {
                    if (formData.password != formData.pass) {
                        Swal.fire(
                            'Oops!',
                            'Passwords do not match!',
                            'warning'
                        );
                    }
                }
            }
            else {
                if (formData.password != atob(allUsers[user_index].password)) {
                    if (formData.password != formData.pass) {
                        Swal.fire(
                            'Oops!',
                            'Passwords do not match!',
                            'warning'
                        );
                    }
                }
            }



            if (formData.password == atob(user.password) || formData.password == atob(allUsers[user_index].password) || formData.password == formData.pass) {
                $.ajax({
                    url: api + 'users/post',
                    type: 'POST',
                    data: JSON.stringify(formData),
                    contentType: 'application/json; charset=utf-8',
                    cache: false,
                    processData: false,
                    success: function (data) {

                        if (ownUserEdit) {
                            window.api.reload();
                        }

                        else {
                            $('#userModal').modal('hide');

                            loadUserList();

                            $('#Users').modal('show');
                            Swal.fire(
                                'Ok!',
                                'User details saved!',
                                'success'
                            );
                        }


                    }, error: function (data) {
                        console.log(data);
                    }

                });

            }

        });



        $('#app').change(function () {
            if ($(this).find('option:selected').text() == 'Network Point of Sale Terminal') {
                $('#net_settings_form').show(500);
                $('#settings_form').hide(500);
                window.api.getMacAddress().then(mac => {
                    $("#mac").val(mac);     // second & third usage
                }).catch(err => {
                    console.error("Failed to get MAC address:", err);
                });

            }
            else {
                $('#net_settings_form').hide(500);
                $('#settings_form').show(500);
            }

        });



        $('#cashier').click(function () {

            ownUserEdit = true;

            $('#userModal').modal('show');

            $("#user_id").val(user.id);
            $("#fullname").val(user.fullname);
            $("#username").val(user.username);
            $("#password").val(atob(user.password));

        });



        $('#add-user').click(function () {

            if (platform.app != 'Network Point of Sale Terminal') {
                $('.perms').show();
            }

            $("#saveUser").get(0).reset();
            $('#userModal').modal('show');

        });



        $('#settings').click(function () {

            if (platform.app == 'Network Point of Sale Terminal') {
                $('#net_settings_form').show(500);
                $('#settings_form').hide(500);

                $("#ip").val(platform.ip);
                $("#till").val(platform.till);

                window.api.getMacAddress().then(mac => {
                    $("#mac").val(mac);     // second & third usage
                }).catch(err => {
                    console.error("Failed to get MAC address:", err);
                });


                $("#app option").filter(function () {
                    return $(this).text() == platform.app;
                }).prop("selected", true);
            }
            else {
                $('#net_settings_form').hide(500);
                $('#settings_form').show(500);

                $("#settings_id").val("1");
                $("#store").val(settings.store);
                $("#address_one").val(settings.address_one);
                $("#address_two").val(settings.address_two);
                $("#contact").val(settings.contact);
                $("#tax").val(settings.tax);
                $("#symbol").val(settings.symbol);
                $("#percentage").val(settings.percentage);
                $("#footer").val(settings.footer);
                $("#logo_img").val(settings.img);
                // if (settings.charge_tax == 'on') {
                //     $('#charge_tax').prop("checked", true);
                // }
                if (settings.img != "") {
                    $('#logoname').hide();
                    $('#current_logo').html(`<img src="${settings.img}" alt="">`);
                    $('#rmv_logo').show();
                }

                $("#app option").filter(function () {
                    return $(this).text() == settings.app;
                }).prop("selected", true);
            }




        });


    });


    $('#rmv_logo').click(function () {
        $('#remove_logo').val("1");
        $('#current_logo').hide(500);
        $(this).hide(500);
        $('#logoname').show(500);
    });


    $('#rmv_img').click(function () {
        $('#remove_img').val("1");
        $('#current_img').hide(500);
        $(this).hide(500);
        $('#imagename').show(500);
    });


    $('#print_list').click(function () {

        $("#loading").show();

        $('#productList').DataTable().destroy();

        const filename = 'productList.pdf';

        html2canvas($('#all_products').get(0)).then(canvas => {
            let height = canvas.height * (25.4 / 96);
            let width = canvas.width * (25.4 / 96);
            let pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);

            $("#loading").hide();
            pdf.save(filename);
        });



        $('#productList').DataTable({
            "order": [[1, "desc"]]
            , "autoWidth": false
            , "info": true
            , "JQueryUI": true
            , "ordering": true
            , "paging": false
        });

        $(".loading").hide();

    });

}


$.fn.print = function () {
    autoPrint = $('#autoPrintReceipt').is(':checked');
    window.api.printReceipt(receipt, autoPrint);

}


    function loadTransactions() {

        let sales = 0;
        let transact = 0;

        let sold_items = [];
        let sold = [];

        let counter = 0;
        let transaction_list = '';
        let query = `by-date?start=${start_date}&end=${end_date}&user=${by_user}&status=${by_status}&till=${by_till}`;

        $.get(api + query, function (transactions) {

            if (transactions.length > 0) {

                $('#transaction_list').empty();
                $('#transactionList').DataTable().destroy();

                allTransactions = [...transactions];


                transactions.forEach((trans, index) => {

                    sales += parseFloat(trans.total);
                    transact++;

                    // Parse items JSON string safely
                    let items = [];
                    if (trans.items) {
                        try {
                            items = typeof trans.items === 'string' ? JSON.parse(trans.items) : trans.items;
                        } catch (err) {
                            console.error("Failed to parse items for transaction", trans.id, err);
                            items = [];
                        }
                    }

                    // Add parsed items to sold_items
                    sold_items.push(...items);

                    // if (!tills.includes(trans.till)) {
                    //     tills.push(trans.till);
                    // }

                    // if (!users.includes(trans.user_id)) {
                    //     users.push(trans.user_id);
                    // }

                    counter++;
                    // Parse customer data safely
                    let customerName = 'Walk in Customer';

                    if (trans.customer) {
                        try {
                            const customer = typeof trans.customer === 'string'
                                ? JSON.parse(trans.customer)
                                : trans.customer;

                            if (customer && customer.name) {
                                customerName = customer.name;
                            } else if (typeof customer === 'string') {
                                customerName = customer;
                            }
                        } catch (e) {
                            customerName = trans.customer; // fallback if JSON.parse fails
                        }
                    }


                    transaction_list += `
                        <tr>
                        <td>${trans?.id}</td>
                        <td class="nobr">${moment(trans?.date).format("YYYY MMM DD hh:mm:ss")}</td>
                        <td>${customerName}</td>
                        <td>${trans?.order_type}</td>
                        <td>${trans?.payment_method}</td>
                        <td>${trans?.discount}</td>
                        <td>${trans?.subtotal}</td>
                        <td>${trans?.total}</td>
                        <td>
                            <button onClick="$(this).deleteTransaction(${trans.id})" class="btn btn-danger btn-xs">
                            <i class="fa fa-trash"></i>
                            </button>
                        </td>
                        <td>
                            ${
                            trans?.paid === ""
                                ? `<button class="btn btn-dark"><i class="fa fa-search-plus"></i></button>`
                                : '<button onClick="$(this).viewTransaction(' + index + ')" class="btn btn-info"><i class="fa fa-search-plus"></i></button>'
                            }
                        </td>
                        </tr>
                        `;


                    if (counter == transactions.length) {

                        $('#total_sales #counter').text(settings.symbol + parseFloat(sales).toFixed(2));
                        $('#total_transactions #counter').text(transact);

                        // Aggregate sold items
                        const result = {};
                        for (const { product_name, price, quantity, id } of sold_items) {
                            if (!result[product_name]) result[product_name] = [];
                            result[product_name].push({ id, price, quantity });
                        }

                        sold = [];
                        for (let item in result) {
                            let price = 0;
                            let quantity = 0;
                            let id = 0;

                            result[item].forEach(i => {
                                id = i.id;
                                price = i.price;
                                quantity += i.quantity;
                            });

                            sold.push({
                                id: id,
                                product: item,
                                qty: quantity,
                                price: price
                            });
                        }

                        loadSoldProducts(sold);

                        // if (by_user == 0 && by_till == 0) {
                        //     userFilter(users);
                        //     tillFilter(tills);
                        // }

                        $('#transaction_list').html(transaction_list);
                        $('#transactionList').DataTable({
                            "order": [[1, "desc"]],
                            "autoWidth": false,
                            "info": true,
                            "JQueryUI": true,
                            "ordering": true,
                            "paging": true,
                            "dom": 'Bfrtip',
                            "buttons": ['csv', 'excel', 'pdf']
                        });
                    }
                });
            } else {
                Swal.fire('No data!', 'No transactions available within the selected criteria', 'warning');
            }

        });
    }


function discend(a, b) {
    if (a.qty > b.qty) {
        return -1;
    }
    if (a.qty < b.qty) {
        return 1;
    }
    return 0;
}


function loadSoldProducts(sold) {

    sold.sort(discend);

    let counter = 0;
    let sold_list = '';
    let items = 0;
    let products = 0;
    $('#product_sales').empty();

    sold.forEach((item, index) => {

        items += item.qty;
        products++;

        let product = allProducts.filter(function (selected) {
            return selected.id == item.id;
        });

        counter++;

        sold_list += `<tr>
            <td>${item.product}</td>
            <td>${item.qty}</td>
            <td>${product[0].stock == 1 ? (product.length > 0 && product[0].quantity > 0 ? product[0].quantity : 'N/A') : 'N/A'}</td>
            <td>${settings.symbol + (item.qty * parseFloat(item.price)).toFixed(2)}</td>
            </tr>`;

        if (counter == sold.length) {
            $('#total_items #counter').text(items);
            $('#total_products #counter').text(products);
            $('#product_sales').html(sold_list);
        }
    });
}


function userFilter(users) {

    $('#users').empty();
    $('#users').append(`<option value="0">All</option>`);

    users.forEach(user => {
        let u = allUsers.filter(function (usr) {
            return usr.id == user;
        });

        $('#users').append(`<option value="${user}">${u[0].fullname}</option>`);
    });

}


function tillFilter(tills) {

    $('#tills').empty();
    $('#tills').append(`<option value="0">All</option>`);
    tills.forEach(till => {
        $('#tills').append(`<option value="${till}">${till}</option>`);
    });

}


$.fn.viewTransaction = function (index) {

    // transaction_index = index;

    let discount = allTransactions[index].discount ? allTransactions[index].discount : 0;
    let customer = 'Walk in Customer';

    if (allTransactions[index].customer) {
        try {
            const customerData = typeof allTransactions[index].customer === 'string' 
                ? JSON.parse(allTransactions[index].customer) 
                : allTransactions[index].customer;

            customer = customerData.name || customerData;
        } catch (e) {
            customer = allTransactions[index].customer;
        }
    }

    let refNumber = allTransactions[index].ref_number != "" ? allTransactions[index].ref_number : allTransactions[index].id;
    let orderNumber = allTransactions[index].id;
    let type = "";
    let order_typ = "";
    let subtotal = "";
    let total = "";
    let items = "";
    let products = JSON.parse(allTransactions[index].items);

    products.forEach(item => {
        items += `<div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 13px;">
            <span style="flex: 2; text-align: left;">${item.product_name}</span>
            <span style="flex: 0.5; text-align: center;">${item.quantity}</span>
            <span style="flex: 1; text-align: right;">${settings.symbol}${parseFloat(item.price).toFixed(2)}</span>
        </div>`;

    });


    switch (allTransactions[index].payment_type) {

        case 2: type = "Online";
            break;

        default: type = "Cash";

    }


    if (allTransactions[index].paid != "") {
        let payment = `<div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 13px;">
                    <span>Paid</span>
                    <span>${settings.symbol + allTransactions[index].paid}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                    <span>Change</span>
                    <span>${settings.symbol + Math.abs(allTransactions[index].change).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                    <span>Method</span>
                    <span>${type}</span>
                </div>`
    }



    // if (settings.charge_tax) {
    //     tax_row = `<tr>
    //             <td>Vat(${settings.percentage})% </td>
    //             <td>:</td>
    //             <td>${settings.symbol}${parseFloat(allTransactions[index].tax).toFixed(2)}</td>
    //         </tr>`;
    // }



    const logoUrl2 = (function(){
        const src = settings.img || '';
        if (!src) return '';
        if (/^(data:|https?:\/\/|file:\/\/)/i.test(src)) return src;
        return `${api}${src}`;
    })();

    receipt = `<div style="font-family: 'Courier New', monospace; font-size: 14px; width: 100%; max-width: 300px; margin: 0; padding: 2px; background: white;" class="receipt">                            
        <div style="text-align: center; margin-bottom: 5px;">
        ${logoUrl2 ? '<img style="max-width: 100px; max-height: 80px;" src ="' + logoUrl2 + '" /><br>' : '<div style=\"font-size: 20px; font-weight: bold; margin-bottom: 5px;\">' + settings.store + '</div>'}
            <div style="font-size: 13px; line-height: 1.3;">${settings.address_one}</div>
            <div style="font-size: 13px; line-height: 1.3;">${settings.address_two}</div>
            ${settings.contact != '' ? '<div style="font-size: 13px;">Tel: ' + settings.contact + '</div>' : ''} 
        </div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
            <div style="font-size: 13px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Invoice:</span><span>${orderNumber}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Ref No:</span><span>${refNumber}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Customer:</span><span>${customer.name ? customer.name : customer}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="font-weight: bold;">Date:</span><span>${moment(allTransactions[index].date).format('DD MMM YYYY HH:mm:ss')}</span></div>
            </div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
        <div style="font-size: 13px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px;">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
            </div>
            ${items}                
 
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span style="font-weight: bold;">Subtotal</span>
                <span style="font-weight: bold;">${settings.symbol}${allTransactions[index].total}</span>
            </div>
            ${discount > 0 ? `<div style="display: flex; justify-content: space-between;">
                <span>Discount</span>
                <span>${settings.symbol}${parseFloat(allTransactions[index].discount).toFixed(2)}</span>
            </div>` : ''}
        
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 8px; padding-top: 5px; border-top: 1px solid #000;">
                <span>TOTAL</span>
                <span>${settings.symbol}${(parseInt(allTransactions[index].total) - discount)}</span>
            </div>
            </div>
            <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
            <div style="text-align: center; font-size: 12px; margin-top: 5px; margin-bottom: 10px;">
             ${settings.footer}
             </div>
            </div>`;

    $('#viewTransaction').html('');
    $('#viewTransaction').html(receipt);

    $('#orderModal').modal('show');

}

$.fn.deleteTransaction = function (id) {

            let data = {
                id: id
            }

            Swal.fire({
                title: "Delete Transaction?",
                text: "This will delete the transaction. Are you sure you want to delete!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {

                if (result.value) {

                    $.ajax({
                        url: api + 'delete',
                        type: 'POST',
                        data: JSON.stringify(data),
                        contentType: 'application/json; charset=utf-8',
                        cache: false,
                        success: function (data) {

                            loadTransactions();

                            Swal.fire(
                                'Deleted!',
                                'You have deleted the transaction!',
                                'success'
                            )

                        }, error: function (data) {
                            $(".loading").hide();

                        }
                    });
                }
            });
}


$('#status').change(function () {
    by_status = $(this).find('option:selected').val();
    loadTransactions();
});



$('#tills').change(function () {
    by_till = $(this).find('option:selected').val();
    loadTransactions();
});


$('#users').change(function () {
    by_user = $(this).find('option:selected').val();
    loadTransactions();
});


$('#order_type').on('change', function() {
    if ($(this).val() === 'Delivery') {
        $('#deliveryAddress').show();
    } else {
        $('#deliveryAddress').hide();
        $('#deliveryAddress').val('');
    }
});

$('#reportrange').on('apply.daterangepicker', function (ev, picker) {

    start = picker.startDate.format('DD MMM YYYY hh:mm A');
    end = picker.endDate.format('DD MMM YYYY hh:mm A');

    start_date = picker.startDate.toDate().toJSON();
    end_date = picker.endDate.toDate().toJSON();


    loadTransactions();
});


function authenticate() {
    $('#loading').append(
        `<div id="load"><form id="account"><div class="form-group"><input type="text" placeholder="Username" name="username" class="form-control"></div>
        <div class="form-group"><input type="password" placeholder="Password" name="password" class="form-control"></div>
        <div class="form-group"><input type="submit" class="btn btn-block btn-default" value="Login"></div></form>`
    );
}


$('body').on("submit", "#account", async function (e) {
    e.preventDefault();
    let formData = $(this).serializeObject();

    if (formData.username == "" || formData.password == "") {
        Swal.fire('Incomplete form!', auth_empty, 'warning');
        return;
    }

    try {
        const data = await $.ajax({
            url: api + 'users/login',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json; charset=utf-8',
            cache: false,
            processData: false,
        });

        if (data.id) {
            // Persist auth and user forever
            await storage.set('auth', { auth: true });
            await storage.set('user', data);

            // Reload the app
            window.api.reload();
        } else {
            Swal.fire('Oops!', auth_error, 'warning');
        }

    } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Login request failed', 'error');
    }
});


$('#quit').click(function () {
    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to close the application.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Close Application'
    }).then((result) => {

        if (result.value) {
            window.api.quit();
        }
    });
});


