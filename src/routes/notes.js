const express = require("express");
const router = express.Router();

const Note = require('../models/Note');
const {isAuthenticated} =require('../helpers/auth');

router.get('/notes/add',isAuthenticated, (req,res) =>{ 
    res.render('notes/new-note');
});

router.post('/notes/new-note',isAuthenticated, async (req,res)=>{
    const {title, description} = req.body;    
    var errors=[];
    if(!title){        
        errors.push({text:'Title is required'});
    }
    if(!description){        
        errors.push({text:'Description is required'});
    }
        
    if(errors.length>0){
        res.render('notes/new-note',{
            errors,
            description,
            title
        });
    }else{
        const note = new Note({title,description})
        note.user = req.user.id;
        await note.save();
        req.flash('success_msg',"Noted added successfully");
        res.redirect('/notes');
    }
});

router.get('/notes/edit/:id',isAuthenticated, async (req, res) => {
    await Note.findById(req.params.id)
        .then(oldNote => {
            const newNote = {
                note : {
                    id: oldNote.id,
                    title: oldNote.title,
                    description: oldNote.description
                }                
            }
            res.render('notes/edit-note',{note:newNote.note});
        })
        .catch(error => res.status(500).send(error));    
});

router.put('/notes/edit-note/:id',isAuthenticated, async (req, res) => {
    const{title, description}= req.body;
    await Note.findByIdAndUpdate(req.params.id,{title,description});
    req.flash('success_msg','Note updated successfully');
    res.redirect('/notes');
});

router.delete('/notes/delete/:id',isAuthenticated, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg','Note deleted successfully');
    res.redirect('/notes');
});

router.get('/notes', isAuthenticated, async (req, res) => {
    await Note.find({user:req.user.id})
        .sort({date: 'desc'})
        .then(oldNotes =>{
            const newNotes = {
                notes : oldNotes.map(data => {
                    return {
                        id: data.id,
                        title: data.title,
                        description: data.description                        
                    }
                })
            }
            res.render('notes/all-notes',{
                notes: newNotes.notes
            });
        })
        .catch(error => res.status(500).send(error)
        );    
});
module.exports = router;