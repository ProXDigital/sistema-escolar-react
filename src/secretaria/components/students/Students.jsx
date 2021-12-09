import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@material-ui/core";
import { PlusOneRounded } from "@material-ui/icons";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { studentsRef } from "../../../services/databaseRefs";
import { LocaleText } from "../../../shared/DataGridLocaleText";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import { handleEnableDisableStudents } from "../../../shared/FunctionsUse";
import StudentInfo from "../../../shared/ViewStudentInfo";

const Students = () => {


    const [ loading, setLoading ] = useState(false);
    const [ open, setOpen ] = useState(false);
    const [ openDialog, setOpenDialog ] = useState(false);

    const [filterModel, setFilterModel] = useState({
        items: [],
    });

    // const [ students, setStudents ] = useState({});  
    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ studentInfo, setStudentInfo ] = useState({})

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    useEffect(() => {
        
        getData()
        
    }, [])
    
    async function getData() {
        setLoading(true)
        let snapshot = await studentsRef.once('value');
        
        let students = snapshot.exists() ? snapshot.val() : []
        let studentsArray = []
        for (const id in students) {
            if (Object.hasOwnProperty.call(students, id)) {
                let student = students[id];
                student.id = id;
                studentsArray.push(student);
            }
        }
        // setStudents(students);
        setRows(studentsArray);
        setLoading(false);
    }

    const handleAddRow = () => {
        let rowsArray = JSON.parse(JSON.stringify(rows))
        rowsArray.push({id: rowsArray.length, label: 'Digite um nome...', placeholder: 'Digite...', required: false})
        setRows(rowsArray)
        console.log(rowsArray)
    }

    const handleRowEdit = async (editedRow) => {
        setLoading(true);
        console.log(editedRow);
        let rowsArray = JSON.parse(JSON.stringify(rows))
        let rowIndex = rowsArray.findIndex(row => row.id === editedRow.id);
        rowsArray[rowIndex][editedRow.field] = editedRow.value;
        setRows(rowsArray);
        console.log(rowsArray)
        // try {
        //     await additionalFieldsRef.set(rowsArray)
        //     setLoading(false)
        // } catch (error) {
        //     console.log(error)
        //     setLoading(false);
        //     throw new Error(error.message)
        // }
        
    }

    const handleRowSelection = (selectedRows) => {
        console.log(selectedRows)
        setSelectedRows(selectedRows)
    }

    const handleDeleteRows = async () => {
        setLoading(true)
        let rowsArray = JSON.parse(JSON.stringify(rows));
        let updatedRows = rowsArray.filter(row => selectedRows.indexOf(row.id) === -1);
        console.log(updatedRows);
        
        // try {
        //     await additionalFieldsRef.set(updatedRows);
        //     setRows(updatedRows);
        //     setLoading(false);
        // } catch (error) {
        //     console.log(error);
        //     setLoading(false);
        //     throw new Error(error.message);
        // }
    }

    const handleRowClick = (e) => {
        console.log(e)
        setOpen(true);
        setStudentInfo({id: e.id, classCode: e.row.turmaAluno})

    }

    const handleConfirmDisable = () => {
        setOpenDialog(true)
    }

    const handleDisableStudents = async () => {
        setOpenDialog(false)
        setLoading(true)
        try {
            let message = await handleEnableDisableStudents(selectedRows)
            getData()
            enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            setLoading(false)
        } catch (error) {
            getData()
            enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            setLoading(false)
        }
    }

    return (
        <Fragment>
            <Dialog 
                 
                 aria-labelledby="confirmation-dialog-title"
                 open={openDialog}
                 onClose={() => setOpenDialog(false)}
            >
                <DialogTitle id="confirmation-dialog-title">Você confirma esta ação?</DialogTitle>
                <DialogContent>
                    <DialogContentText>{selectedRows.length > 1 ? 'Serão' : 'Será'} desativado{selectedRows.length > 1 && 's'} {selectedRows.length} aluno{selectedRows.length > 1 && 's'}.</DialogContentText>
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDisableStudents} color="primary" autoFocus>
                        Sim
                    </Button>
                </DialogActions>
            </Dialog>
            <FullScreenDialog 
                isOpen={open}
                onClose={() => {
                    setOpen(false);
                }}
                hideSaveButton
                onSave={() => {
                    alert('Save clicked')
                }}
                title={"Informações do aluno"}
                saveButton={"Salvar"}
                saveButtonDisabled={true}
            > 
                <StudentInfo studentInfo={studentInfo} />
            </FullScreenDialog>
            <Grid
            justifyContent="flex-start"   
            container
            direction="row"
            spacing={2}
            >
                
                
                <Grid item xs={12}>
                    <div style={{ height: "59vh", width: '100%' }}>
                        <DataGrid 
                            filterModel={filterModel}
                            onFilterModelChange={(model) => setFilterModel(model)}
                            rows={rows} 
                            columns={
                                [
                                    {field: 'nomeAluno', headerName: 'Nome', width: 300},
                                    {field: 'matriculaAluno', headerName: 'Matrícula', width: 140},
                                    {field: 'turmaAluno', headerName: 'Turma', width: 180},
                                    {field: 'emailAluno', headerName: 'E-mail', width: 220},
                                    {field: 'celularAluno', headerName: 'Celular', width: 180},
                                    {field: 'turmaAluno', headerName: 'Turma', width: 180},
                            
                                ]
                            } 
                            disableSelectionOnClick 
                            checkboxSelection
                            components={{
                                Toolbar: GridToolbar

                            }}
                            onCellEditCommit={handleRowEdit}
                            loading={loading}
                            localeText={LocaleText}
                            onSelectionModelChange={handleRowSelection}
                            onRowClick={handleRowClick}
                        />
                    </div>
                   
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => {handleAddRow()}}><PlusOneRounded />Botão</Button>
                    
                </Grid>
                <Grid item>
                    {selectedRows.length > 0 && (<Button variant="contained" color="secondary" onClick={() => {handleConfirmDisable()}}>Desativar selecionado{selectedRows.length > 1 && 's'}</Button>)}
                </Grid>
            </Grid>
        </Fragment>
        
    );
}
 
export default Students;