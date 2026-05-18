<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\AIService;

class ChatController extends Controller
{
    public function ask(Request $request, AIService $ai)
    {
        $question = $request->question;

        /*
        schema dari database team
        */
        $schema = "
        Table transaksi:
        - id
        - nama
        - tanggal
        - total
        ";

        /*
        generate sql dari AI
        */
        $sql = $ai->generateSQL(
            $question,
            $schema
        );

        /*
        security
        */
        if (
            !str_starts_with(
                strtolower(trim($sql)),
                'select'
            )
        ) {
            return response()->json([
                'success' => false,
                'error' => 'Only SELECT allowed'
            ]);
        }

        try {

            /*
            execute sql
            */
            $result = DB::select($sql);

            return response()->json([
                'success' => true,
                'question' => $question,
                'sql' => $sql,
                'data' => $result
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'sql' => $sql,
                'error' => $e->getMessage()
            ]);
        }
    }
}