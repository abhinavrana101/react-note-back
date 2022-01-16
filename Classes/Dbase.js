const mysql = require("mysql");
let instance = null;

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect(function (err) {
  if (err) {
    throw err;
  }
  console.log("Connected to database ");
});

const close = () => {
  connection.end();
};

class Dbase {
  insertKeys = [];
  insertValues = [];
  updateSets = [];
  updateValues = [];

  static getDbaseInstance() {
    return instance ? instance : new Dbase();
  }

  async query(sql) {
    try {
      const response = await new Promise((res, rej) => {
        connection.query(sql, (err, result) => {
          if (err) {
            rej(new Error(err.message));
          }
          res(result);
        });
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async fetchAll(sql) {
    try {
      const response = await new Promise((res, rej) => {
        this.query(sql)
          .then((data) => res(data))
          .catch((err) => rej(err));
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async fetchOne(sql) {
    try {
      const response = await new Promise((res, rej) => {
        this.query(sql).then((data) => {
          let out = null;
          for (const item of data) {
            out = item;
            break;
          }
          res(out);
        });
      });
      return response;
    } catch (error) {
      console.log(err);
    }
  }

  prepareInsert(obj) {
    try {
      if (obj) {
        this.insertKeys = [];
        this.insertValues = [];

        for (const key in obj) {
          this.insertKeys.push(key);
          this.insertValues.push(obj[key]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  convertToString(arg) {
    let resString = arg.map((a) => `'${a}'`).join(",");
    return resString;
  }

  async insert(table) {
    try {
      const response = await new Promise((res, rej) => {
        if (
          table.length > 0 &&
          this.insertKeys.length > 0 &&
          this.insertValues.length > 0
        ) {
          const values = this.convertToString(this.insertValues);
          const sql = `INSERT INTO ${table} (${this.insertKeys.toString()}) values (${values})`;
          this.query(sql)
            .then((data) => res(data.insertId))
            .catch((err) => rej(err));
        }
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  prepareUpdate(set, where) {
    try {
      if (set && where) {
        this.updateSets = [];
        this.updateValues = [];
        for (const key in set) {
          const formattedSet = `${key} = '${set[key]}'`;
          this.updateSets.push(formattedSet);
        }

        for (const whereKey in where) {
          const formattedWhere = `${whereKey} = '${where[whereKey]}'`;
          this.updateValues.push(formattedWhere);
        }
      }
      // console.log(this.updateValues)
    } catch (error) {
      console.log(error);
    }
  }

  async update(table) {
    try {
      const response = await new Promise((res, rej) => {
        if (
          table.length > 0 &&
          this.updateSets.length > 0 &&
          this.updateValues.length > 0
        ) {
          this.updateValues = this.updateValues.join(" AND ");
          const sql = `UPDATE ${table} SET  ${this.updateSets} WHERE ${this.updateValues} `;
          this.query(sql)
            .then((data) => res(data.affectedRows))
            .catch((err) => rej(err));
        }
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Dbase;
