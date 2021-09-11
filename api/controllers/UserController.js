/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    login: async function (req, res) {

        if (req.method == "GET") return res.view('user/login');

        if (!req.body.username || !req.body.password) return res.badRequest();

        var user = await User.findOne({ username: req.body.username });

        if (!user) return res.status(401).send("User not found");

        const match = await sails.bcrypt.compare(req.body.password, user.password);

        if (!match) return res.status(401).send("Wrong Password");

        req.session.regenerate(function (err) {

            if (err) return res.serverError(err);

            req.session.username = req.body.username;
            req.session.uid = user.id;
            req.session.role = user.role;

            sails.log("[Session] ", req.session);

            return res.ok("Login successfully.");

        });

    },

    logout: async function (req, res) {

        req.session.destroy(function (err) {

            if (err) return res.serverError(err);

            return res.redirect('/estate/index');

        });
    },

    json: async function (req, res) {

        var users = await User.find();

        return res.json(users);

    },

    populate: async function (req, res) {

        var model = await User.findOne(req.session.uid).populate("owns");

        if (req.wantsJSON) {

            return res.json({ 'user': model })

        } else {

            return res.view("user/populate/", { 'user': model });

        }
    },


    add: async function (req, res) {

        if (!await User.findOne(req.session.uid)) return res.notFound();

        const thatEstate = await Estate.findOne(req.params.fk).populate("ownedBy", { id: req.session.uid });

        if (!thatEstate) return res.notFound();

        if (thatEstate.ownedBy.length)
            return res.status(409).send("Already added.");   // conflict

        if (thatEstate.ownedBy.length < thatEstate.tenants) {
            await User.addToCollection(req.session.uid, "owns").members(req.params.fk);
            return res.ok('You successfully rent this property.');
        }

        return res.status(422).send('This property not available for rent.');
    },

    remove: async function (req, res) {

        if (!await User.findOne(req.session.uid)) return res.notFound();

        const thatEstate = await Estate.findOne(req.params.fk).populate("ownedBy", { id: req.session.uid });

        if (!thatEstate) return res.notFound();

        if (!thatEstate.ownedBy.length)
            return res.status(409).send("Nothing to delete.");    // conflict

        await User.removeFromCollection(req.session.uid, "owns").members(req.params.fk);

        return res.ok('You successfully move out from this property.');

    },

};

