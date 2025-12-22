import fs from 'node:fs'
import path from 'path'

export default function handler(req, res) {
    var data;
    
    if (req.cookies.auth == 1) {
        const data_file = path.join(process.cwd(), 'header', 'logout_button.html');
        console.log("loading: ", data_file);
        data = fs.readFileSync(data_file, 'utf-8');
    } else {
        data = ''
    }
    return res.status(200).json({html: data})
}
