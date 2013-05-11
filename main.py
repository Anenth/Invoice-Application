import webapp2, datetime, logging, json
from pytz.gae import pytz
from google.appengine.ext.webapp import template
from google.appengine.ext import db


class MainHandler(webapp2.RequestHandler):
    def get(self):
        q = db.GqlQuery('SELECT * FROM Counter')
        result =q.get()
        if result:
            billno = result.billno
        else:
            counter = Counter(billno = 1)
            billno = 1
            counter.put();
        values = {
            'billno' : billno,
            'date' :getDateTime()
        }
        self.response.write(template.render('main.html', values))

def getDateTime():
    d = datetime.datetime.today()
    UTC=pytz.timezone('UTC')
    india=pytz.timezone('Asia/Kolkata')
    dd=UTC.localize(d)
    dd=dd.astimezone(india)
    return dd
class Product(db.Model):
    desc    = db.StringProperty(required=True)
    price   = db.IntegerProperty(required=True)
    id      = db.IntegerProperty(required=True)
    qty     = db.IntegerProperty(required=True)
    pdate   = db.DateProperty()
    mdate   = db.DateProperty()
class Invoice(db.Model):
    pids    = db.StringProperty(required=True)
    billno  = db.IntegerProperty(required=True)
    price   = db.FloatProperty(required=True) 
    idate   = db.DateTimeProperty(auto_now_add = True)
class Counter(db.Model):
    billno  = db.IntegerProperty()
class NewProduct(webapp2.RequestHandler):
    def get(self):
        handmade_key = db.Key.from_path('Product', 1)
        new_ids = db.allocate_ids(handmade_key, 1)
        new_id_num = int(new_ids[0])
        new_key = db.Key.from_path('Product', new_id_num)
        product = Product(key=new_key,
                id      = new_key.id(),
                desc    = self.request.get('desc'),
                price   = int(self.request.get('price')),
                qty     = int(self.request.get('qty')))
        product.pdate = datetime.datetime.now().date()
        product.mdate = datetime.datetime.now().date()
        product.put();
        self.redirect('/product')             
        
class ProductPage(webapp2.RequestHandler):
    def get(self):
      
        products = db.GqlQuery('SELECT * FROM Product ORDER BY pdate DESC')
        values = {
            'products' : products,
            'numberproducts' : products.count()
        }
        self.response.write(template.render('product.html', values))

class AddStock(webapp2.RequestHandler):
    def get(self):
        q = db.GqlQuery("SELECT * FROM Product " +
                "WHERE desc = :1 AND id=:2" ,
                self.request.get('addStock_desc'),
                int(self.request.get('addStock_id')))
        
        result =q.get()
        if result:
            result.qty = int(int(self.request.get('addStock_qty')) + int(result.qty))
            result.mdate = datetime.datetime.now().date()
            result.put();
        self.redirect('/product')  
class RemoveProduct(webapp2.RequestHandler):
    def post(self):
        q = db.GqlQuery("SELECT * FROM Product " +
                "WHERE id=:1" ,
                int(self.request.get('del_id')))
        result =q.get()
        if result:
            result.delete();
        self.redirect('/product') 
class TH_stockid(webapp2.RequestHandler):
    def get(self):
        if self.request.get('desc'):
            products = db.GqlQuery('SELECT * FROM Product WHERE desc >= :1',self.request.get('query'))
        else:
            products = db.GqlQuery('SELECT * FROM Product WHERE id >= :1',int(self.request.get('query')))
        records = []
        for temp in products.run(limit=10):
            record = {"id":temp.id, "desc":temp.desc, "price":temp.price, "qty":temp.qty}
            records.append(record)    
        my_response = records
        rjson = json.dumps(my_response)
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        self.response.out.write(rjson)

class resetBillNo(webapp2.RequestHandler):
    def get(self):
        q = db.GqlQuery('SELECT * FROM Counter')
        result =q.get()
        if result:
            result.billno = 1
        else:
            counter = Counter(billno = 1)
        counter.put();
        return "true"

        
class SaveInvoice(webapp2.RequestHandler):
    def get(self):
        invoice = Invoice(billno=int(self.request.get('billno')),
                pids    = self.request.get('pids_qty'),
                price   = float(self.request.get('price')))
        invoice.put();
        pids_data = json.loads(self.request.get('pids'))
        qtys_data = json.loads(self.request.get('qtys'))
        q = db.GqlQuery('SELECT * FROM Counter')
        counter = q.get()
        if counter:
            counter.billno = int(counter.billno + 1)
        counter.put();
        j = -1
        for i in pids_data:
            j = j + 1
            q = db.GqlQuery("SELECT * FROM Product " +
                "WHERE id=:1" ,int(i))
            result =q.get()
            if result:
                result.qty = int( int(result.qty) - int(qtys_data[j])) 
                result.mdate = datetime.datetime.now().date()
                result.put();
class ReportPage(webapp2.RequestHandler):
    def get(self):
      
        products = db.GqlQuery('SELECT price FROM Invoice WHERE idate =:1',datetime.datetime.now().date())
        values = {
            'sales_t'   : 1,
            'sales_m'   : 2,
            'expense_t' : 1,
            'expense_m' : 2
        }
        self.response.write(template.render('report.html', values))       
class ReportCharts(webapp2.RequestHandler):
    def get(self):
        if self.request.get('desc'):
            products = db.GqlQuery('SELECT * FROM Product WHERE desc >= :1',self.request.get('query'))
        else:
            products = db.GqlQuery('SELECT * FROM Product WHERE id >= :1',int(self.request.get('query')))
        records = []
        for temp in products.run(limit=10):
            record = {"id":temp.id, "desc":temp.desc, "price":temp.price, "qty":temp.qty}
            records.append(record)    
            
        my_response = records
        rjson = json.dumps(my_response)
        self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
        self.response.out.write(rjson)
            
#logging.info("-------------------------------------------------------------------------------")
#logging.info(result.desc)                self.response.write("---------------")
#logging.info("-------------------------------------------------------------------------------")
        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/product', ProductPage),
    ('/newProduct', NewProduct),
    ('/addStock', AddStock),
    ('/typeahead_stockid', TH_stockid),
    ('/removeProduct', RemoveProduct),
    ('/save_invoice', SaveInvoice),
    ('/reset_billno', resetBillNo),
    ('/report', ReportPage),
    ('/report_chart', ReportCharts),
], debug=True)
