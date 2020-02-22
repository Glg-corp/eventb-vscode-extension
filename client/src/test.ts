import { extensions, window, Uri } from 'vscode';
import { GitExtension } from './git';
import { VersionedTextDocumentIdentifier } from 'vscode-languageclient';


const gitExtension = extensions.getExtension<GitExtension>('vscode.git').exports;
const api = gitExtension.getAPI(1);
