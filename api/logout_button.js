import fs from 'node:fs'

export default function handler(req, res) {
    var data;
    
    if (req.cookies.auth == 1) {
        const data_file = 'header/logout_button.html'
        data = fs.readFileSync(data_file, 'utf-8');
    } else {
        data = ''
    }
    return res.status(200).json({html: data})
}
