/**
 * EstateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    // action - create
    create: async function (req, res) {

        if (req.method == "GET")
            return res.view('estate/create');

        if (!req.body.Estate)
            return res.badRequest("Form-data not received.");

        await Estate.create(req.body.Estate);

        return res.ok("Successfully created!");
    },

    // json function
    json: async function (req, res) {

        var estates = await Estate.find();

        return res.json(estates);
    },

    // action - index
    index: async function (req, res) {

        const numOfItems = 4;

        var models = await Estate.find({
            where: { highlighted: "on" },
            limit: numOfItems,
        });

        return res.view('estate/index', { estates: models });

    },


    // action - admin
    admin: async function (req, res) {

        var value = await Estate.find();
        return res.view('estate/admin', { estates: value });

    },

    // action - view
    view: async function (req, res) {

        var model = await Estate.findOne(req.params.id);

        if (!model) return res.notFound();

        return res.view('estate/view', { estate: model });

    },

    // action - details
    details: async function (req, res) {

        var values = await Estate.findOne(req.params.id).populate('ownedBy', {

            where: { id: req.session.uid, },
        });

        if (!values) return res.notFound();

        return res.view('estate/details', { estates: values });

    },


    // action - delete 
    delete: async function (req, res) {

        if (req.method == "GET") return res.forbidden();

        var models = await Estate.destroy(req.params.id).fetch();

        if (models.length == 0) return res.notFound();

        // return res.ok("Estate Deleted.");

        if (req.wantsJSON) {
            return res.json({ message: "Person deleted.", url: '/' });    // for ajax request
        } else {
            return res.redirect('/');           // for normal request
        }
    },

    // action - update
    update: async function (req, res) {

        if (req.method == "GET") {

            var models = await Estate.findOne(req.params.id);

            if (!models) return res.notFound();

            return res.view('estate/view', { estate: models });

        } else {

            if (!req.body.Estate)
                return res.badRequest("Form-data not received.");

            var model = await Estate.update(req.params.id).set({
                title: req.body.Estate.title,
                image: req.body.Estate.image,
                bedrooms: req.body.Estate.bedrooms,
                name: req.body.Estate.name,
                area: req.body.Estate.area,
                tenants: req.body.Estate.tenants,
                rent: req.body.Estate.rent,
            }).fetch();

            if (model.length == 0) return res.notFound();

            return res.ok("Record updated");

        }
    },

    //search function
    search: async function (req, res) {

        const qName = req.query.name || "";
        const qBedrooms = parseInt(req.query.bedrooms);
        const qMinArea = parseInt(req.query.area);
        const qMaxArea = parseInt(req.query.area);
        const qMinRent = parseInt(req.query.minRent);
        const qMaxRent = parseInt(req.query.maxRent);

        if (isNaN(qBedrooms) && isNaN(qMinArea) && isNaN(qMaxArea) && isNaN(qMinRent) && isNaN(qMaxRent)) {  //if qBedroom, qMinArea, qMaxArea, qMinRent, qMaxRent is not a number

            var model = await Estate.find({
                where: { name: { contains: qName } },
                sort: 'name',
            });

        } else if (isNaN(qMinArea) && isNaN(qMaxArea) && isNaN(qMinRent) && isNaN(qMaxRent)) {

            var model = await Estate.find({
                where: { name: { contains: qName }, bedrooms: qBedrooms },
                sort: 'name',
            });

        } else if (isNaN(qBedrooms) && isNaN(qMaxArea) && isNaN(qMinRent) && isNaN(qMaxRent)) {

            var model = await Estate.find({
                where: { name: { contains: qName }, area: { '>=': qMinArea } },
                sort: 'name',
            });
        } else if (isNaN(qBedrooms) && isNaN(qMinArea) && isNaN(qMinRent) && isNaN(qMaxRent)) {

            var model = await Estate.find({
                area: { '<=': qMaxArea }, where: { name: { contains: qName } },
                sort: 'name',
            });
        } else if (isNaN(qMaxArea) && isNaN(qMinRent) && isNaN(qMaxRent)) {
            var model = await Estate.find({
                where: { name: { contains: qName }, bedrooms: qBedrooms, area: { '>=': qMinArea } },
                sort: 'name',
            });
        } else if (isNaN(qMinRent) && isNaN(qMaxRent)) {
            var model = await Estate.find({
                where: { name: { contains: qName }, bedrooms: qBedrooms, area: { '>=': qMinArea, '<=': qMaxArea } },
                sort: 'name',
            });
        } else if (isNaN(qMaxRent)) {
            var model = await Estate.find({
                where: { name: { contains: qName }, bedrooms: qBedrooms, area: { '>=': qMinArea, '<=': qMaxArea }, rent: { '>=': qMinRent } },
                sort: 'name',
            });
        } else {
            var model = await Estate.find({
                where: { name: { contains: qName }, bedrooms: qBedrooms, area: { '>=': qMinArea, '<=': qMaxArea }, rent: { '>=': qMinRent, '<=': qMaxRent } },
                sort: 'name',
            });
        }

        return res.view('estate/paginate', { estates: model, count: 2 });
    },


    // action - paginate
    paginate: async function (req, res) {

        const qPage = Math.max(req.query.page - 1, 0) || 0;

        const numOfItemsPerPage = 2;

        var models = await Estate.find({
            limit: numOfItemsPerPage,
            skip: numOfItemsPerPage * qPage
        });

        var numOfPage = Math.ceil(await Estate.count() / numOfItemsPerPage);

        return res.view('estate/paginate', { estates: models, count: numOfPage });
    },

    populate: async function (req, res) {

        var model = await Estate.findOne(req.params.id).populate("ownedBy");

        if (!model) return res.findOne();

        return res.view('estate/populate', { 'users': model.ownedBy });

    },

    //return res.json(model);
};

