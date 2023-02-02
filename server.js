const express = require('express');
const app = express();
const session = require('express-session')
const mongoDBsession = require('connect-mongodb-session')(session)
const bodyParser= require('body-parser');
const MongoClient= require('mongodb').MongoClient;

const uri = "mongodb+srv://hazimsuhairi:1Ii29032001@cluster0.t5fvonl.mongodb.net/?retryWrites=true&w=majority";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()); //teach it to read JSON 
app.use(express.static('./Image'))

MongoClient.connect(uri, { useUnifiedTopology: true},
  (err, client) => {
    if (err) return console.error(err)
    console.log('Connected to Database')
    const db = client.db('schoolDB')
    const db2 = client.db('authentication')
    const studentlist = db.collection('student')
    const teacherlist = db.collection('teacher')
    const adminlist = db.collection('admin')
    const classlist = db.collection('class')
    const registered_class = db.collection('registered_class')
    const class_teached = db.collection('class_teached')
    const subjectlist = db.collection('subject')
    const userlist = db2.collection('user')


    const store = new mongoDBsession({
      uri: uri,
      collection: 'sessions'
    })

    app.use(session({
      secret: 'secret key for cookie',
      resave: false, //don't create a new session for every request
      saveUninitialized:false, //if session is untouched it will not be saved
      store: store
    }))

    const studentisAuth = (req,res, next)=>{
      if(req.session.isAuth){
      next()
    }else{res.redirect('/')}
    }

    const teacherisAuth = (req,res, next)=>{
      if(req.session.isAuth){
      next()
    }else{res.redirect('/')}
    }

    const adminisAuth = (req,res, next)=>{
      if(req.session.isAuth){
      next()
    }else{res.redirect('/')}
    }

    app.get('/header.html', (req,res) =>{
      res.sendFile(__dirname + '/header.html')
    })
    app.get('/', (req,res)=>{
      console.log(req.session)
      console.log(req.session.id)
      res.sendFile(__dirname + '/login2.html')
    })

    app.get('/login2.html', (req,res)=>{
      console.log(req.session)
      console.log(req.session.id)
      res.sendFile(__dirname + '/login2.html')
    })

    app.get('/register2.html', (req,res)=>{
      console.log(req.session)
      console.log(req.session.id)
      res.sendFile(__dirname + '/register2.html')
    })

    app.post('/login', async(req,res)=>{
      const email = req.body.email;
      const pass = req.body.pass;
      console.log(req.body)
      const compareid = await userlist.findOne({email});
      const comparepass = await userlist.findOne({pass});
      if (!compareid){ //if student_id not same
        res.redirect('/')
      }
      else if (!comparepass){ //if pass not same
        res.redirect('/')
      }
      else{
        req.session.isAuth = true;
        req.session.email = email;
        console.log(req.session.email)
        userlist.findOne({email:req.body.email}).then(results => {
          res.render('dashboard', { user: results })
          console.log(results)
  
        })
        .catch(error => console.error(error))
      }
    })


    app.get('/login.html', (req,res)=>{
      console.log(req.session)
      console.log(req.session.id)
      res.sendFile(__dirname + '/login.html')
    })

    app.post('/register', async (req, res) => {
      const {email, pass} = req.body;
      let user = await userlist.findOne({email});
      if (user){ //if student_id already exist
        res.send('already exist')
      }
      else{
      console.log(req.body)
      userlist.insertOne(req.body)
        .then(result => {
          res.redirect('/login2.html')
          console.log(result)
        })
        .catch(error => console.error(error))
      }
    })
////////////////////////STUDENT////////////////////////////////////
    app.post('/register_student', async (req, res) => {
        const {student_id, email} = req.body;
        let user = await studentlist.findOne({student_id});
        if (user){ //if student_id already exist
          res.send('already exist')
        }
        else{
        console.log(req.body)
        studentlist.insertOne(req.body)
          .then(result => {
            res.redirect('/login.html')
            console.log(result)
          })
          .catch(error => console.error(error))
        }
      })

      app.post('/login_student', async(req,res)=>{
        const student_id = req.body.student_id;
        const pass = req.body.pass;
        console.log(req.body)
        const compareid = await studentlist.findOne({student_id});
        const comparepass = await studentlist.findOne({pass});
        if (!compareid){ //if student_id not same
          res.redirect('/')
        }
        else if (!comparepass){ //if pass not same
          res.redirect('/')
        }
        else{
          req.session.isAuth = true;
          req.session.student_id = student_id;
          console.log(req.session.student_id)
          res.redirect('/dashboard_student.html')
        }
      })

      app.get('/dashboard_student.html', studentisAuth, (req,res)=>{
        res.sendFile(__dirname + '/dashboard_student.html')
      })

      app.get('/register_student.html', (req,res)=>{
        res.sendFile(__dirname + '/register_student.html')
      })

      app.get('/studentprofile', (req, res) => {
        console.log(req.session.student_id)
        studentlist.findOne({student_id:req.session.student_id}).then(results => {
            res.render('studentprofile', { student: results })
            console.log(results)

          })
          .catch(error => console.error(error))
      })

      app.post('/update', (req, res) => {
        studentlist.findOne(req.body).then(results => {
          res.render('updateprofile', { student: results })
            console.log(results)
          })
          .catch(error => console.error(error))
      })

      app.post('/apply-update', (req, res) => {
        studentlist.findOneAndUpdate(
            { student_id: req.body.student_id },
            {
              $set: {
                f_name: req.body.f_name,
                l_name: req.body.l_name,
                email: req.body.email,
                pass: req.body.pass,
                phone_num: req.body.phone_num
              }
            },
          )
          .then(result => {
            console.log(result)
            res.redirect('studentprofile')
          })
          .catch(error => console.error(error))
        console.log(req.body)
      })

      app.get('/register_class', (req, res) => {db.collection('class').find().toArray().then(results => {
            studentlist.findOne({student_id:req.session.student_id}).then(resultstudent => {
              console.log(results)
              console.log(resultstudent)
              res.render('register_class', { 
                classvar: results,
                student: resultstudent })
              }).catch(error => console.error(error))
      })
    })

     app.post('/apply_register_class', (req, res) => {
        registered_class.insertOne(req.body)
          .then(result => {
            console.log(result)
            res.redirect('/dashboard_student.html')
          })
          .catch(error => console.error(error))
      })
  
      app.get('/registeredclass', (req, res) => {
        studentlist.findOne({student_id:req.session.student_id}).then(resultstudent => {
        registered_class.aggregate([
          { $lookup:
             {
               from: 'class',
               localField: 'class_id',
               foreignField: 'class_id',
               as: 'registeredclass'
             }
           },
           {
            $match: { student_id: resultstudent.student_id}
           },
           {
            $unwind: '$registeredclass'
           },
           {
            $addFields:{
              "class_id": "$registeredclass.class_id",
              "class_name": "$registeredclass.class_name",
              "subject_id": "$registeredclass.subject_id",
              "teacher_id": "$registeredclass.teacher_id",
            }
           }
          ]).toArray().then(results =>{
            res.render('registeredclass', {data:results})
            console.log(results)
          })
        })
      })
      app.get('/registeredsubject', (req, res) => {
        studentlist.findOne({student_id:req.session.student_id}).then(resultstudent => {
        registered_class.aggregate([
          { $lookup:
             {
               from: 'subject',
               localField: 'class_id',
               foreignField: 'class_id',
               as: 'registeredsubject'
             }
           },
           {
            $match: { student_id: resultstudent.student_id}
           },
           {
            $unwind: '$registeredsubject',
           },
           {
            $addFields:{
              "subject_id": "$registeredsubject.subject_id",
              "subject_name": "$registeredsubject.subject_name",
              "subject_desc": "$registeredsubject.subject_desc",
            }
           }
          ]).toArray().then(results =>{
            res.render('registeredsubject', {data:results})
            console.log(results)
          })
        })
      })

      app.post('/delete', (req, res) => {
        studentlist.deleteOne(
          { student_id: req.body.student_id }
        )
        .then(result => {
          res.redirect('/')
        })
        .catch(error => console.error(error))
    })

    /////////////////////////// TEACHER ////////////////////////////////////
    app.get('/register_teacher.html', (req,res)=>{
      res.sendFile(__dirname + '/register_teacher.html')
    })

    app.post('/register_teacher', async (req, res) =>  {
      const {teacher_id, teacher_email} = req.body;
      let user = await teacherlist.findOne({teacher_id});
      if (user){ //if student_id already exist
        res.send('teacher already exist')
      }
      else{
      console.log(req.body)
      teacherlist.insertOne(req.body)
        .then(result => {
          res.redirect('/login.html')
          console.log(result)
        })
        .catch(error => console.error(error))
      }
    })
    app.post('/login_teacher', async(req,res)=>{
      const {teacher_id, teacher_pass} = req.body;
      console.log(req.body)
      const compareid = await teacherlist.findOne({teacher_id});
      const comparepass = await teacherlist.findOne({teacher_pass});
      if (!compareid){ //if teacher_id not same
        res.redirect('/')
      }
      else if (!comparepass){ //if pass not same
        res.redirect('/')
      }
      else{
        req.session.isAuth = true;
        req.session.teacher_id = teacher_id;
        console.log(req.session.teacher_id)
        res.redirect('/dashboard_teacher.html')
      }
    })

    app.get('/header_teach.html', (req,res) =>{
      res.sendFile(__dirname + '/header_teach.html')
    })

    app.get('/dashboard_teacher.html', teacherisAuth, (req,res)=>{
      res.sendFile(__dirname + '/dashboard_teacher.html')
    })

    app.get('/teacherprofile', (req, res) => {
      teacherlist.findOne({teacher_id:req.session.teacher_id}).then(results => {
          res.render('teacherprofile', { teacher: results })
          console.log(results)
        })
        .catch(error => console.error(error))
    })

    app.post('/update_teacher', (req, res) => {
      teacherlist.findOne(req.body).then(results => {
        res.render('updateprofile_teacher', { teacher: results })
          console.log(results)
        })
        .catch(error => console.error(error))
    })

    app.post('/apply-update-teacher', (req, res) => {
      teacherlist.findOneAndUpdate(
          { teacher_id: req.body.teacher_id },
          {
            $set: {
              teacher_f_name: req.body.teacher_f_name,
              teacher_l_name: req.body.teacher_l_name,
              teacher_email: req.body.teacher_email,
              teacher_pass: req.body.teacher_pass,
              teacher_phone_num: req.body.teacher_phone_num
            }
          },
        )
        .then(result => {
          console.log(result)
          res.redirect('teacherprofile')
        })
        .catch(error => console.error(error))
      console.log(req.body)
    })

    app.get('/teachedsubject', (req, res) => {
      teacherlist.findOne({teacher_id:req.session.teacher_id}).then(resultteacher => {
      console.log(resultteacher.teacher_id)
      class_teached.aggregate([
        { $lookup:
           {
             from: 'subject',
             localField: 'class_id',
             foreignField: 'class_id',
             as: 'teachedsubject'
           }
         },
         {
          $match: { teacher_id: resultteacher.teacher_id}
         },
         {
          $unwind: '$teachedsubject',
         },
         {
          $addFields:{
            "subject_id": "$teachedsubject.subject_id",
            "subject_name": "$teachedsubject.subject_name",
            "subject_desc": "$teachedsubject.subject_desc",
          }
         }
        ]).toArray().then(result =>{
          res.render('teachedsubject', {data:result})
          console.log(result)
        })
      })
    })

    app.get('/studentlist', (req,res)=>{
      studentlist.find().toArray().then(result=>{
        res.render('studentlist', {student:result})
      })

    })
//////////////////////////////ADMIN////////////////////////////////////////
app.post('/login_admin', async(req,res)=>{
  const {admin_id, admin_pass} = req.body;
  console.log(req.body)
  const compareid = await adminlist.findOne({admin_id});
  const comparepass = await adminlist.findOne({admin_pass});
  if (!compareid){ //if admin_id not same
    res.redirect('/')
  }
  else if (!comparepass){ //if pass not same
    res.redirect('/')
  }
  else{
    req.session.isAuth = true;
    req.session.admin_id = admin_id;
    console.log(req.session.admin_id)
    res.redirect('/dashboard_admin.html')
  }
})

app.get('/header_admin.html', (req,res) =>{
  res.sendFile(__dirname + '/header_admin.html')
})

app.get('/dashboard_admin.html', adminisAuth, (req,res)=>{
  res.sendFile(__dirname + '/dashboard_admin.html')
})

app.get('/studentlist_admin', (req,res)=>{
  studentlist.find().toArray().then(result=>{
    res.render('studentlist_admin', {student:result})
  })

})

app.post('/createstud_admin', (req,res) =>{
  res.render('createstud_admin')
})

app.post('/register_student-admin', async (req, res) => {
  const {student_id, email} = req.body;
  let user = await studentlist.findOne({student_id});
  if (user){ //if student_id already exist
    res.send('already exist')
  }
  else{
  console.log(req.body)
  studentlist.insertOne(req.body)
    .then(result => {
      res.redirect('/studentlist_admin')
      console.log(result)
    })
    .catch(error => console.error(error))
  }
})

app.post('/updatestud_admin', (req, res) => {
  const {student_id} = req.body;
  console.log(student_id)
  studentlist.findOne(req.body).then(results => {
    res.render('updatestud_admin', { student: results })
      console.log(results)
    })
    .catch(error => console.error(error))
})


app.post('/apply-update-admin', (req, res) => {
  studentlist.findOneAndUpdate(
      { student_id: req.body.student_id },
      {
        $set: {
          student_id: req.body.student_id,
          f_name: req.body.f_name,
          l_name: req.body.l_name,
          email: req.body.email,
          pass: req.body.pass,
          phone_num: req.body.phone_num
        }
      },
    )
    .then(result => {
      console.log(result)
      res.redirect('studentlist_admin')
    })
    .catch(error => console.error(error))
  console.log(req.body)
})

app.post('/deletestud_admin', (req, res) => {
  studentlist.deleteOne(
    { student_id: req.body.student_id }
  )
  .then(result => {
    res.redirect('/studentlist_admin')
  })
  .catch(error => console.error(error))
})

app.get('/teacherlist_admin', (req,res)=>{
  teacherlist.find().toArray().then(result=>{
    res.render('teacherlist_admin', {teacher:result})
  })
})

app.post('/createteach_admin', (req,res) =>{
  res.render('createteach_admin')
})

app.post('/createteach_admin2', async (req, res) => {
  const {teacher_id} = req.body;
  let user = await teacherlist.findOne({teacher_id});
  if (user){ //if student_id already exist
    res.send('already exist')
  }
  else{
    teacherlist.insertOne(req.body).then(resultteacher => {
    db.collection('class').find().toArray().then(results => {
        teacherlist.findOne(req.body).then(teacher =>{
          console.log(teacher)
          console.log(results)
          res.render('createteach_admin2', {
            classvar: results,
            teacher: teacher })
          })
        }).catch(error => console.error(error))
        })
      }
    })

  app.post('/apply_register_class-admin', (req, res) => {
      class_teached.insertOne(req.body)
        .then(result => {
          console.log(result)
          res.redirect('/dashboard_admin.html')
        })
        .catch(error => console.error(error))
    })
    
    app.post('/update_teacher2', (req, res) => {
      teacherlist.findOne(req.body).then(results => {
        res.render('updateprofile_teacher2', { teacher: results })
          console.log(results)
        })
        .catch(error => console.error(error))
    })

    app.post('/apply-update-teacher2', (req, res) => {
      teacherlist.findOneAndUpdate(
          { teacher_id: req.body.teacher_id },
          {
            $set: {
              teacher_f_name: req.body.teacher_f_name,
              teacher_l_name: req.body.teacher_l_name,
              teacher_email: req.body.teacher_email,
              teacher_pass: req.body.teacher_pass,
              teacher_phone_num: req.body.teacher_phone_num
            }
          },
        )
        .then(result => {
          console.log(result)
          res.redirect('teacherlist_admin')
        })
        .catch(error => console.error(error))
      console.log(req.body)
    })

app.post('/updateteach_admin', (req, res) => {
  const {teacher_id} = req.body;
  console.log(teacher_id)
  teacherlist.findOne(req.body).then(results => {
    res.render('updateteach_admin', { teacher: results })
      console.log(results)
    })
    .catch(error => console.error(error))
})

app.post('/apply-update_teach-admin', (req, res) => {
  teacherlist.findOneAndUpdate(
      { teacherlist: req.body.teacher_id },
      {
        $set: {
          teacher_f_name: req.body.teacher_f_name,
          teacher_l_name: req.body.teacher_l_name,
          teacher_email: req.body.teacher_email,
          teacher_pass: req.body.teacher_pass,
          teacher_phone_num: req.body.teacher_phone_num
        }
      },
    )
    .then(result => {
      console.log(result)
      res.redirect('teacherlist_admin')
    })
    .catch(error => console.error(error))
  console.log(req.body)
})

app.post('/deleteteach_admin', (req, res) => {
  teacherlist.deleteOne(
    { teacher_id: req.body.teacher_id}
  ).then(result => {
    res.redirect('/teacherlist_admin')
  })
  .catch(error => console.error(error))
})

app.get('/subjectlist_admin', (req,res)=>{
  subjectlist.find().toArray().then(result=>{
    res.render('subjectlist_admin', {subject:result})
  })
})

app.post('/createsub_admin', (req,res) =>{
  res.render('createsub_admin')
})

app.post('/registersub_admin', async (req, res) => {
  const {subject_id } = req.body;
  let user = await subjectlist.findOne({subject_id});
  if (user){ //if student_id already exist
    res.send('already exist')
  }
  else{
  console.log(req.body)
  subjectlist.insertOne(req.body)
    .then(result => {
      res.redirect('/subjectlist_admin')
      console.log(result)
    })
    .catch(error => console.error(error))
  }
})

app.post('/updatesub_admin', (req, res) => {
  const {subject_id} = req.body;
  console.log(subject_id)
  subjectlist.findOne(req.body).then(results => {
    res.render('updatesub_admin', { subject: results })
      console.log(results)
    })
    .catch(error => console.error(error))
})
app.post('/apply-update_sub-admin', (req, res) => {
  console.log(req.body.subject_id)
  console.log(req.body.subject_name)
  console.log(req.body.subject_desc)
  subjectlist.findOneAndUpdate(
      { subject_id: req.body.subject_id},
      {
        $set: {
          subject_id: req.body.subject_id,
          subject_name: req.body.subject_name,
          subject_desc: req.body.subject_desc
        }
      },
      res.redirect('/subjectlist_admin')
    )
    .catch(error => console.error(error))
})

app.post('/deletesub_admin', (req, res) => {
  subjectlist.deleteOne(
    { subject_id: req.body.subject_id}
  ).then(result => {
    res.redirect('/subjectlist_admin')
  })
  .catch(error => console.error(error))
})

    app.get('/logout', (req,res)=>{
      req.session.destroy((err)=>{
        if (err) throw err;
        res.redirect('/');
      })
    })
})
app.listen(process.env.PORT || 3000,function(){
    console.log('listening on 3000')
})