const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const Contractor = require("../models/Contractor");
const upload = require("../config/multer");
const fs = require("fs").promises;
const Stock = require("../models/Stock");
const Sold = require("../models/Sold");
const Land = require("../models/Land");
const { initPayment, responsePayment } = require("../paytm/services/index");
const Request = require("../models/Request");
const Payment = require("../models/Payment");

router.get("/login", authentication.ensureNoLogin, (req, res) => {
	res.render("contractors/login");
});

router.post(
	"/login",
	authentication.ensureNoLogin,
	passport.authenticate("contractorLocal", { failureRedirect: "/contractors/login" }),
	(req, res) => {
		res.redirect("/contractors/dashboard");
	}
);

router.get("/signup", authentication.ensureNoLogin, (req, res) => {
	res.render("contractors/signup");
});

router.post(
	"/",
	authentication.ensureNoLogin,
	upload.single("image"),
	wrapAsync(async (req, res) => {
		const { password } = req.body;
		const contractor = new Contractor(req.body);
		if (req.file) contractor.image = `/images/uploads/${req.file.filename}`;
		try {
			await Contractor.register(contractor, password);
			req.login(contractor, (err) => {
				if (err) throw err;
				else res.redirect("/contractors/dashboard");
			});
		} catch (err) {
			if (req.file) await fs.unlink(`/images/uploads/${req.file.filename}`);
			throw err;
		}
	})
);

router.get("/dashboard", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	res.render("contractors/dashboard");
});

router.get("/dashboard/stock", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	res.render("contractors/search/stock");
});

router.post(
	"/dashboard/stock",
	authentication.ensureLogin,
	authorization.ensureContractor,
	wrapAsync(async (req, res) => {
		const filter = {};
		for (const key in req.body) {
			if (req.body[key] !== "none") filter[key] = req.body[key];
		}
		try {
			const stocks = await Stock.find(filter);
			res.send(stocks);
		} catch {
			res.send([]);
		}
	})
);

router.get(
	"/stock/:id",
	authentication.ensureLogin,
	authorization.ensureContractor,
	wrapAsync(async (req, res) => {
		Stock.findById(req.params.id).then((data) => {
			res.render("contractors/search/stockInfo", { data: data });
		});
	})
);

router.get(
	"/paymentHistory",
	authentication.ensureLogin,
	authorization.ensureContractor,
	wrapAsync(async (req, res) => {
		Payment.find({ contractor: req.user._id })
			.populate(["requestId", "contractor", "farmer"])
			.then((data) => {
				// res.json(data);
				res.render('contractors/search/paymentHistory',{payments: data});
			});
	})
);

var Amount = 0;
var _id;
var Qty;
var Response;
router.post;
router.post("/buyStock/:id", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	Qty = req.body.qty;
	_id = req.params.id;
	qty = Qty;
	Stock.findById(_id)
		.then((data) => {
			const newStock = data;
			newStock.qty.amount = newStock.qty.amount - qty;
			if (newStock.qty.amount >= 0) {
				Amount = qty * newStock.price;
			}
			console.log("here");
			Response = "buyStock";
			res.redirect("/contractors/pay");
		})
		.catch((err) => console.log(err));
});

// Callback Post Route for buying a Stock
router.post("/payResponse", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	if (Response == "buyStock") {
		qty = Qty;
		_id = _id;
		Stock.findById(_id)
			.then((data) => {
				const newStock = data;
				newStock.qty.amount = newStock.qty.amount - qty;
				if (newStock.qty.amount >= 0) {
					newQty = {
						amount: qty,
						unit: data.qty.unit,
					};
					const sold = new Sold({
						farmer: data.farmer,
						contractor: req.user._id,
						Stock: _id,
						qty: newQty,
						price: qty * data.price,
					});
					sold.save();
				}
				if (newStock.qty.amount >= 0) {
					Stock.findByIdAndUpdate(_id, newStock, { upsert: true }).then((data) => console.log(data));
				}
				console.log("here stock");
				res.redirect("/contractors/dashboard/stock");
			})
			.catch((err) => console.log(err));
	} else {
		amount = Amount;
		_id = _id;
		Request.findById(_id)
			.populate(["land"])
			.then((data) => {
				const newStock = data;
				newStock.amountRemaining = newStock.amountRemaining + Amount;
				Request.findByIdAndUpdate(_id, { amountRemaining: newStock.amountRemaining }, { upsert: true })
					.then((data) => console.log(data))
					.catch((err) => console.log(err));
				payment = new Payment({
					requestId: data._id,
					contractor: data.contractor,
					farmer: data.land.farmer,
					amount: Amount,
				});
				payment.save();
				res.redirect("/contractors/acceptedContract");
			})
			.catch((err) => console.log(err));
	}
});

router.get("/dashboard/land", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	res.render("contractors/search/land");
});

router.post(
	"/dashboard/land",
	authentication.ensureLogin,
	authorization.ensureContractor,
	wrapAsync(async (req, res) => {
		const filter = {};
		for (const key in req.body) {
			if (req.body[key] !== "none") filter[key] = req.body[key];
		}
		try {
			const lands = await Land.find(filter);
			for (const land of lands) await land.populate("farmer").execPopulate();
			res.send(lands);
		} catch {
			res.send([]);
		}
	})
);

router.get("/acceptedContract", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	//
	Request.find({ contractor: req.user._id, accepted: true })
		.populate(["contractor", "land"])
		.then((data) => {
			// res.json({data})
			console.log(data);
			let len = data.length;
			res.render("contractors/search/acceptedContract", { data: data, len: len });
		});
});

router.post("/contractAccept/:id", authentication.ensureLogin, authorization.ensureContractor, (req, res) => {
	amount = req.body.amount;
	_id = req.params.id;
	Request.findById(_id)
		.then((data) => {
			if (data.totalAmount - data.amountRemaining >= amount) {
				Amount = amount;
				Response = "contractAccepted";
				res.redirect("/contractors/pay");
			} else {
				res.redirect("/contractors/acceptedContract");
			}
		})
		.catch((err) => console.log(err));
});

router.get("/pay", (req, res) => {
	initPayment(Amount).then(
		(success) => {
			res.render("paytmRedirect.ejs", {
				resultData: success,
				paytmFinalUrl: "https://securegw-stage.paytm.in/theia/processTransaction",
			});
		},
		(error) => {
			res.send(error);
		}
	);
});

router.post(
	"/createRequest/:landId",
	authentication.ensureLogin,
	authorization.ensureContractor,
	wrapAsync(async (req, res) => {
		const request = new Request(req.body);
		request.land = req.params.landId;
		request.contractor = req.user._id;
		await request.save();
		res.redirect("/contractors/dashboard/land");
	})
);

module.exports = router;
