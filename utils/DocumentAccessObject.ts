/**
 * @author Kingsley Baah Brew <kingsleybrew@gmail.com>
 * @class DocumentAccessObject
 * @todo It helps to query database
 */

export default class DocumentAccessObject<T, G> {

    private model!: any

    public constructor(db: T) {
        this.model = db;
    }

    public async save(modelData: G | any): Promise<any> {
        let data = {}
        try {
            if(modelData.id !== undefined || modelData.id !== null) {
                delete modelData.id;
            }
            data = await this.model.create(modelData);
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    public async findAll(): Promise<any> {
        return this.model.findAll();
    }

    public async findByOne(whereQuery: any): Promise<any> {
        let data = {}
        try {
            data = await this.model.findOne({where: whereQuery});
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    public async find(searchQuery: any): Promise<any> {
        let data = {}
        try {
            data = await this.model.findOne(searchQuery);
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    public async filter(searchQuery: any): Promise<any> {
        let data = {}
        try {
            data = await this.model.findAll(searchQuery);
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    public async deleteByOne(whereQuery: any): Promise<any> {
          try {
            await this.model.destroy({where: whereQuery});
            return true;
        } catch(err) {
            console.log(err);
        }
        return false;
    }

    public async update(whereQuery: any,data: any): Promise<any> {
        try {
            await this.model.update(data, {
                where: whereQuery
              })
            return true;
        } catch(err) {
            console.log(err);
        }
        return false;
    }
}