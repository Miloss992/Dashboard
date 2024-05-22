require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    phone: String
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('user', userSchema);

const financeDataSchema = new mongoose.Schema({
    segment: {
        type: String,
        required: [true, "Please check your data, Segment is not specified!"],
    },
    country: {
        type: String,
        required: [true, "Please check your data, Country is not specified!"],
    },
    product: {
        type: String,
        required: [true, "Please check your data, Product is not specified!"],
    },
    discountBand: {
        type: String,
        required: [true, "Please check your data, discountBand is not specified!"],
    },
    unitsSold: {
        type: Number,
        required: [true, "Please check your data, unitsSold is not specified!"],
    },
    manufacturingPrice: {
        type: Number,
        required: [true, "Please check your data, manufacturingPrice is not specified!"],
    },
    salePrice: {
        type: Number,
        required: [true, "Please check your data, salePrice is not specified!"],
    },
    grossSales: {
        type: Number,
        required: [true, "Please check your data, grossSales is not specified!"],
    },
    discounts: {
        type: Number,
        required: [true, "Please check your data, discounts is not specified!"],
    },
    sales: {
        type: Number,
        required: [true, "Please check your data, sales is not specified!"],
    },
    costsOfSales: {
        type: Number,
        required: [true, "Please check your data, costsOfSales is not specified!"],
    },
    profit: {
        type: Number,
        required: [true, "Please check your data, profit is not specified!"],
    },
    date: {
        type: Date,
        required: [true, "Please check your data, date is not specified!"],
    },
    uCostsOfSales: {
        type: Number,
        required: [true, "Please check your data, uCostsOfSales is not specified!"],
    },

});
const FinanceData = mongoose.model("financeData", financeDataSchema);

const MessagesSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
});
const Message = mongoose.model("Message", MessagesSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.DB);

app.use((req, res, next) => {
    res.locals.moment = moment;
    next();
});

app.get('/Register', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        res.render('Account/Register', { message: req.flash('info'), login: req.isAuthenticated() });
    }

});

app.post('/Register', (req, res) => {
    if (req.body.password !== req.body.confirmPassword) {
        req.flash('info', 'Password and Confirm password do not match.');
        res.redirect('/Register');
    }
    else {
        User.findOne({ username: req.body.username }).then((d) => {
            if (d === null) {
                User.register(new User({ username: req.body.username }), req.body.password, (err) => {
                    if (err) {
                        console.log('error while user registering!', err);
                        req.flash('info', 'There was an error while registering.');
                        res.redirect('/Register');
                    }
                    else {
                        res.redirect('/');
                    }
                });
            }
            else {
                req.flash('info', 'This email address is already taken.');
                res.redirect('/Register');
            }
        })
    }
});

app.get('/Login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/Dashboard');
    }
    else {
        res.render('Account/Login', { message: req.flash('info'), login: req.isAuthenticated() });
    }
});

app.post('/Login', passport.authenticate('local', { failureRedirect: '/Login', failureFlash: { type: 'info', message: 'Email or Password Is Incorrect.' }, }), (req, res) => {
    res.redirect('/Dashboard');
});

app.post('/Logout', (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) { return next(err); }
            res.redirect('/');
        });
    }
    else {
        res.redirect('/');
    }
});

app.get('/', (req, res) => {
    res.redirect('/Login');
});

app.get('/Dashboard', (req, res) => {

    if (req.isAuthenticated()) {

        FinanceData.find().sort('-date').then((data) => {

            const currentYear = moment(new Date()).format('YYYY');
            const previousYear = moment(new Date()).subtract(1, 'y').format('YYYY');

            let totalSalesNext = 0;
            let totalProfitNext = 0;
            let totalCostsNext = 0;
            let totalSalesPrev = 0;
            let totalProfitPrev = 0;
            let totalCostsPrev = 0;
            let date = [];
            let costs = [];
            let grossSales = [];
            let product = [];
            let country = [];
            let segment = [];

            data.forEach(e => {
                date.push(e.date);
                costs.push(e.costsOfSales);
                grossSales.push(e.grossSales);
                product.push(e.product);
                country.push(e.country);
                segment.push(e.segment);
            });

            data.forEach(e => {
                if (moment(e.date).format('YYYY') === currentYear) {
                    totalSalesNext += e.sales;
                    totalProfitNext += e.profit;
                    totalCostsNext += e.costsOfSales
                }
            });
            data.forEach(e => {
                if (moment(e.date).format('YYYY') === previousYear) {
                    totalSalesPrev += e.sales;
                    totalProfitPrev += e.profit;
                    totalCostsPrev += e.costsOfSales
                }
            });
            let salesDif = totalSalesNext - totalSalesPrev;
            let profitDif = totalProfitNext - totalProfitPrev;
            let costsDif = totalCostsNext - totalCostsPrev;

            let RSdate = date.slice(0, 10);
            let RScosts = costs.slice(0, 10);
            let RSgrossSales = grossSales.slice(0, 10);
            let RSproduct = product.slice(0, 10);
            let RScountry = country.slice(0, 10);
            let RSsegment = segment.slice(0, 10);
            const RS = { RSdate, RScosts, RSgrossSales, RSproduct, RScountry, RSsegment, };

            FinanceData.find().sort('-unitsSold').then((data2) => {

                let productT = [];
                let unitsSold = [];
                let profit = [];
                let salePrice = [];
                let manufacturingPrice = [];

                data2.forEach(e => {
                    productT.push(e.product);
                    unitsSold.push(e.unitsSold);
                    profit.push(e.profit);
                    salePrice.push(e.salePrice);
                    manufacturingPrice.push(e.manufacturingPrice);
                });
                let TSproduct = productT.slice(0, 10);
                let TSunitsSold = unitsSold.slice(0, 10);
                let TSprofit = profit.slice(0, 10);
                let TSsalePrice = salePrice.slice(0, 10);
                let TSmanufacturingPrice = manufacturingPrice.slice(0, 10);
                const TS = { TSproduct, TSunitsSold, TSprofit, TSsalePrice, TSmanufacturingPrice }
                if (TS.TSproduct.length < 10 || TSunitsSold.length < 10 || TSprofit.length < 10 || TSsalePrice.length < 10 || TSmanufacturingPrice.length < 10 || RSdate.length < 10 || RScosts.length < 10 || RSgrossSales.length < 10 || RSproduct.length < 10 || RScountry.length < 10 || RSsegment.length < 10) {
                    let options = {
                        totalSalesNext: totalSalesNext, totalProfitNext: totalProfitNext, totalCostsNext: totalCostsNext, totalSalesPrev: totalSalesPrev, totalProfitPrev: totalProfitPrev, totalCostsPrev: totalCostsPrev,
                        salesDif: salesDif, profitDif: profitDif, costsDif: costsDif, RS: false, TS: false, user: req.user.username, login: req.isAuthenticated()
                    };
                    res.render('FinanceData/Dashboard', options);
                }
                else {
                    let options = {
                        totalSalesNext: totalSalesNext, totalProfitNext: totalProfitNext, totalCostsNext: totalCostsNext, totalSalesPrev: totalSalesPrev, totalProfitPrev: totalProfitPrev, totalCostsPrev: totalCostsPrev,
                        salesDif: salesDif, profitDif: profitDif, costsDif: costsDif, RS: RS, TS: TS, user: req.user.username, login: req.isAuthenticated()
                    };
                    res.render('FinanceData/Dashboard', options);
                }
            });
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.get('/Create', (req, res) => {

    if (req.isAuthenticated()) {
        const options = { user: req.user.username, login: req.isAuthenticated() }
        res.render('FinanceData/Create', options);
    }
    else {
        res.redirect('/Login');
    }
});

app.get('/Table', (req, res) => {

    if (req.isAuthenticated()) {
        FinanceData.find().sort('-date').then((data) => {
            const financeData = data;
            let options = { financeData: financeData, user: req.user.username, login: req.isAuthenticated() };
            res.render('FinanceData/Table', options);
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.get('/Chart', (req, res) => {

    if (req.isAuthenticated()) {
        const options = { user: req.user.username, login: req.isAuthenticated() }
        res.render('FinanceData/Chart', options);
    }
    else {
        res.redirect('/Login');
    }
});

app.get('/Index', (req, res) => {

    if (req.isAuthenticated()) {
        const options = { message: req.flash('info'), user: req.user.username, phone: req.user.phone, login: req.isAuthenticated() }
        res.render('Account/Index', options);
    }
    else {
        res.redirect('/Login');
    }
});

app.get('/Contact', (req, res) => {

    if (req.isAuthenticated()) {
        const options = { user: req.user.username, login: req.isAuthenticated() }
        res.render('Account/Contact', options);
    }
    else {
        const options = { login: req.isAuthenticated() }
        res.render('Account/Contact', options);
    }
});

app.get('/Terms', (req, res) => {

    if (req.isAuthenticated()) {
        const options = { user: req.user.username, login: req.isAuthenticated() }
        res.render('Account/Terms', options);
    }
    else {
        const options = { login: req.isAuthenticated() }
        res.render('Account/Terms', options);
    }

});

app.get('/Messages', (req, res) => {

    if (req.isAuthenticated()) {
        Message.find({}).then(data => { res.send(data) })
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Create', (req, res) => {

    if (req.isAuthenticated()) {
        let salePrice = Number(req.body.manufacturingPrice) + (Number(req.body.manufacturingPrice) * 25 / 100);
        let grossSales = salePrice * Number(req.body.unitsSold);
        let discounts = 0;
        switch (req.body.discountBand) {
            case "High (10%)": { discounts = grossSales * 10 / 100; break; }
            case "Medium (5%)": { discounts = grossSales * 5 / 100; break; }
            case "Low (2%)": { discounts = grossSales * 2 / 100; break; }
            case "None (0%)": { discounts = 0; break; }
            default: { discounts = 0; break; }
        };
        let costsOfSales = Number(req.body.uCostsOfSales) + (Number(req.body.unitsSold) * Number(req.body.manufacturingPrice));
        let sales = grossSales - discounts;

        FinanceData.create({
            segment: req.body.segment,
            country: req.body.country,
            product: req.body.product,
            discountBand: req.body.discountBand,
            unitsSold: req.body.unitsSold,
            manufacturingPrice: req.body.manufacturingPrice,
            salePrice: salePrice,
            grossSales: grossSales,
            discounts: discounts,
            sales: sales,
            costsOfSales: costsOfSales,
            profit: sales - costsOfSales,
            date: req.body.date,
            uCostsOfSales: req.body.uCostsOfSales
        }).then(() => {
            res.redirect('/Table');
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Delete', (req, res) => {

    if (req.isAuthenticated()) {
        FinanceData.findById(req.body.deleteItem).then((data) => {
            const fData = data;
            let options = { fData: fData, user: req.user.username, login: req.isAuthenticated() };
            res.render('FinanceData/Delete', options);
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Delete!', (req, res) => {

    if (req.isAuthenticated()) {
        FinanceData.findByIdAndDelete(req.body.delete).then(() => {
            res.redirect('/Table');
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Edit', (req, res) => {

    if (req.isAuthenticated()) {
        FinanceData.findById(req.body.editItem).then((data) => {
            const fData = data;
            let options = { fData: fData, user: req.user.username, login: req.isAuthenticated() };
            res.render('FinanceData/Edit', options);
        });
    }
    else {
        res.redirect('/Login');
    }
})

app.post('/Edit!', (req, res) => {

    if (req.isAuthenticated()) {
        let salePrice = Number(req.body.manufacturingPrice) + (Number(req.body.manufacturingPrice) * 25 / 100);
        let grossSales = salePrice * Number(req.body.unitsSold);
        let discounts = 0;
        switch (req.body.discountBand) {
            case "High (10%)": { discounts = grossSales * 10 / 100; break; }
            case "Medium (5%)": { discounts = grossSales * 5 / 100; break; }
            case "Low (2%)": { discounts = grossSales * 2 / 100; break; }
            case "None (0%)": { discounts = 0; break; }
            default: { discounts = 0; break; }
        };
        let costsOfSales = Number(req.body.uCostsOfSales) + (Number(req.body.unitsSold) * Number(req.body.manufacturingPrice));
        let sales = grossSales - discounts;

        FinanceData.findByIdAndUpdate(req.body.edit, {
            segment: req.body.segment,
            country: req.body.country,
            product: req.body.product,
            discountBand: req.body.discountBand,
            unitsSold: req.body.unitsSold,
            manufacturingPrice: req.body.manufacturingPrice,
            salePrice: salePrice,
            grossSales: grossSales,
            discounts: discounts,
            sales: sales,
            costsOfSales: costsOfSales,
            profit: sales - costsOfSales,
            date: req.body.date,
            uCostsOfSales: req.body.uCostsOfSales
        }).then(() => {
            res.redirect('/Table');
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/ChartData', (req, res) => {

    if (req.isAuthenticated()) {
        FinanceData.find().sort('-date').then((data) => {
            // Data sorted by date
            const date = [];
            const profit = [];
            const costsOfSales = [];
            const sales = [];
            const discounts = [];
            const grossSales = [];
            const salePrice = [];
            const manufacturingPrice = [];
            const unitsSold = [];
            const discountBand = [];
            const product = [];
            const country = [];
            const segment = [];

            data.forEach(e => {
                date.push(e.date);
                profit.push(e.profit);
                costsOfSales.push(e.costsOfSales);
                sales.push(e.sales);
                discounts.push(e.discounts);
                grossSales.push(e.grossSales);
                salePrice.push(e.salePrice);
                manufacturingPrice.push(e.manufacturingPrice);
                unitsSold.push(e.unitsSold);
                discountBand.push(e.discountBand);
                product.push(e.product);
                country.push(e.country);
                segment.push(e.segment);
            });
            const sortedByDate = { date, profit, costsOfSales, sales, discounts, grossSales, salePrice, manufacturingPrice, unitsSold, discountBand, product, country, segment };

            //Data for  segment chart
            let s1Sales = 0;
            let s2Sales = 0;
            let s3Sales = 0;
            let s4Sales = 0;
            let s5Sales = 0;

            data.forEach(e => {
                if (e.segment === "Segment1") {
                    s1Sales += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.segment === "Segment2") {
                    s2Sales += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.segment === "Segment3") {
                    s3Sales += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.segment === "Segment4") {
                    s4Sales += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.segment === "Segment5") {
                    s5Sales += e.unitsSold
                }
            });
            const segmentChart = { s1Sales, s2Sales, s3Sales, s4Sales, s5Sales };

            //Data for Country sales
            let c1Sales = 0;
            let c2Sales = 0;
            let c3Sales = 0;
            let c4Sales = 0;
            let c5Sales = 0;

            data.forEach(e => {
                if (e.country === "Country1") {
                    c1Sales += e.sales
                }
            });
            data.forEach(e => {
                if (e.country === "Country2") {
                    c2Sales += e.sales
                }
            });
            data.forEach(e => {
                if (e.country === "Country3") {
                    c3Sales += e.sales
                }
            });
            data.forEach(e => {
                if (e.country === "Country4") {
                    c4Sales += e.sales
                }
            });
            data.forEach(e => {
                if (e.country === "Country5") {
                    c5Sales += e.sales
                }
            });
            const countrySales = { c1Sales, c2Sales, c3Sales, c4Sales, c5Sales };

            //Data for Units sold by country
            let c1Units = 0;
            let c2Units = 0;
            let c3Units = 0;
            let c4Units = 0;
            let c5Units = 0;

            data.forEach(e => {
                if (e.country === "Country1") {
                    c1Units += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.country === "Country2") {
                    c2Units += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.country === "Country3") {
                    c3Units += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.country === "Country4") {
                    c4Units += e.unitsSold
                }
            });
            data.forEach(e => {
                if (e.country === "Country5") {
                    c5Units += e.unitsSold
                }
            });
            const countryUnits = { c1Units, c2Units, c3Units, c4Units, c5Units };

            let options = { sortedByDate: sortedByDate, segmentChart: segmentChart, countrySales: countrySales, countryUnits: countryUnits };
            res.send(options);
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Index-profile', (req, res) => {

    if (req.isAuthenticated()) {

        User.findOne({ username: req.body.username }).then(d => {
            if (d === null) {
                req.flash('info', "Username doesn't exist.");
                res.redirect('/Index');
            }
            else {
                User.findOneAndUpdate({ username: req.body.username }, { phone: req.body.phoneNumber }).then(d => {
                    res.redirect('/Index');
                });
            }
        })
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Index-email', (req, res) => {

    if (req.isAuthenticated()) {
        User.findOne({ username: req.body.email }).then(d => {
            if (d === null) {
                req.flash('info', "Email doesn't exist.");
                res.redirect('/Index');
            }
            else {
                User.findOne({ username: req.body.newEmail }).then(d => {
                    if (d === null) {
                        User.findOneAndUpdate({ username: req.body.email }, { username: req.body.newEmail }).then(d => {
                            res.redirect('/Index');
                        });
                    }
                    else {
                        req.flash('info', "Email already exist.");
                        res.redirect('/Index');
                    }
                });
            }
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Index-password', (req, res) => {

    if (req.isAuthenticated()) {
        User.findOne({ username: req.body.email }).then(d => {
            if (d === null) {
                req.flash('info', "Email doesn't exist.");
                res.redirect('/Index');
            }
            else {
                if (req.body.newPassword !== req.body.confirmPassword) {
                    req.flash('info', 'Password and Confirm password do not match.');
                    res.redirect('/Index');
                }
                else {
                    User.findOneAndDelete({ username: req.body.email }).then(d => {
                        User.register(new User({ username: req.body.email }), req.body.newPassword, (err) => {
                            if (err) {
                                console.log('error while user registering!', err);
                                req.flash('info', 'There was an error while registering.');
                                res.redirect('/Index');
                            }
                            else {
                                res.redirect('/Index');
                            }
                        });
                    });
                }
            }
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Index-delete', (req, res) => {

    if (req.isAuthenticated()) {

        User.findOneAndDelete({ username: req.body.username }).then(d => {
            if (d === null) {
                req.flash('info', "Email doesn't exist.");
                res.redirect('/Index');
            }
            else {
                res.redirect('/Index');
            }
        });
    }
    else {
        res.redirect('/Login');
    }
});

app.post('/Contact', (req, res) => {

    Message.create({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
    }).then(() => { res.redirect('/'); })
});

app.post('/', (req, res) => {

    if (req.isAuthenticated()) {
        res.status(200);
        res.redirect('/');
    }
    else {
        res.status(200);
        res.redirect('/Login');
    }
});

app.use(function (req, res, next) {
    res.status(404);
    if (req.isAuthenticated()) {
        res.render('partials/404', { user: req.user.username, login: req.isAuthenticated() });
    }
    else {
        res.render('partials/404', { user: null, login: req.isAuthenticated() });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
