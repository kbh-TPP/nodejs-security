let noGTkHave = function(req, res) {
    let cookie = req.cookie['user'];
    let hash = 9999;
    for (let i = 0; i < cookie.length; i++) {
        hash += (hash << 5) + cookie.charAt(i).charCodeAt();
    }
    hash = hash & 0x7fffffff;
    let user_g_tk = req.query['g_tk'] || "";
    if (user_g_tk == hash) {
        res.json({
            data: {},
            status: {
                code: 200,
                msg: 'success'
            }
        });
    }
};